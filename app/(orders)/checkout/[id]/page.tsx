"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Loader2, 
  AlertCircle,
  Truck,
  IndianRupee,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenResponse {
  email: string;
  name: string;
  userId: string;
  userType: string;
}

interface UserDetails {
  _id: string;
  email: string;
  name: string;
  companyName: string;
  mobileNo: string;
  gstNo: string;
  userType: string;
  pincode: string;
  verify: boolean;
  nba: string[];
  shippingDetails: string;
  sts: string;
  tradeNam: string;
  profileImage: string;
  userId: string;
  billingDetails: string;
}

interface Requirement {
  _id: string;
  status: string;
  productName: string;
  commission: number;
  minQty: number;
  seller_email: string;
  amount: number;
  description: string;
  company: string;
  measurement: string;
  pincode: string;
  reqId: string;
  buyer_email: string;
  mobile: string;
  hsnCode: string;
  gstPercentage: number;
  negotiation: boolean;
  pid: number;
  created_at: string;
  __v: number;
}

const OrdersComponent: React.FC = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [sameAddress, setSameAddress] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.API_URL || "https://sabecho.com";
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedIds = searchParams.get('ids')?.split(',') || [];

  // Number formatter for Indian locale
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    verifyTokenAndFetchUser();
    if (selectedIds.length > 0) {
      fetchRequirements(selectedIds);
    } else {
      setRequirements([]);
    }
  }, [searchParams]);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const verifyTokenAndFetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getCookie('token');
      if (!token) {
        router.push('/');
        return;
      }

      // Verify token
      const tokenResponse = await fetch(`${API_URL}/api/v1/verifyToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Token verification failed');
      }

      const tokenData: TokenResponse = await tokenResponse.json();

      // Fetch user details
      const userResponse = await fetch(`${API_URL}/api/v1/profile?email=${tokenData.email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData: UserDetails = await userResponse.json();
      setUser(userData);
      setBillingAddress(userData.billingDetails || '');
      setShippingAddress(userData.shippingDetails || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirements = async (ids: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const token = getCookie('token');
      if (!token) {
        router.push('/');
        return;
      }

      const requirementPromises = ids.map(async (id) => {
        const response = await fetch(`${API_URL}/api/v1/quotaRequirement/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch requirement ${id}`);
        }

        return response.json();
      });

      const requirementsData: Requirement[] = await Promise.all(requirementPromises);
      setRequirements(requirementsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdate = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getCookie('token');
      if (!token || !user) return;

      const payload = {
        billingAddress,
        shippingAddress: sameAddress ? billingAddress : shippingAddress,
      };

      const response = await fetch(`${API_URL}/api/v1/user/${user.userId}/billing`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update addresses');
      }

      // Refetch user data after update
      await verifyTokenAndFetchUser();
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateGST = () => {
    return requirements.reduce((totalGST, req) => {
      const gstAmount = (req.amount * req.gstPercentage) / 100;
      return totalGST + gstAmount;
    }, 0);
  };

  const calculateSubtotal = () => {
    return requirements.reduce((total, req) => total + req.amount, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const gst = calculateGST();
    return subtotal + gst;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle size={24} />
          <span className="text-lg">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-100 min-h-screen">
      {/* Address Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Update Addresses</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="billing-address" className="text-sm font-medium text-gray-700">Billing Address</Label>
              <Input
                id="billing-address"
                placeholder="Enter billing address"
                value={billingAddress}
                onChange={(e) => {
                  setBillingAddress(e.target.value);
                  if (sameAddress) setShippingAddress(e.target.value);
                }}
                disabled={loading}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping-address" className="text-sm font-medium text-gray-700">Shipping Address</Label>
              <Input
                id="shipping-address"
                placeholder="Enter shipping address"
                value={sameAddress ? billingAddress : shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                disabled={loading || sameAddress}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="same-address"
                checked={sameAddress}
                onCheckedChange={(checked) => {
                  setSameAddress(checked as boolean);
                  if (checked) setShippingAddress(billingAddress);
                }}
              />
              <Label htmlFor="same-address" className="text-sm text-gray-600">Billing and shipping addresses are the same</Label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddressUpdate}
              disabled={loading || !billingAddress}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Addresses"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <h1 className="text-2xl font-bold text-gray-900">Order Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Information and Addresses */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User size={18} className="text-gray-600" />
                <span>Buyer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600 font-medium">Company Name:</span>
                  <span className="ml-2 text-gray-900">{user?.companyName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="ml-2 text-gray-900">{user?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="ml-2 text-gray-900">{user?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Mobile:</span>
                  <span className="ml-2 text-gray-900">{user?.mobileNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">GST No:</span>
                  <span className="ml-2 text-gray-900">{user?.gstNo || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Billing Address */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <CreditCard size={18} className="text-gray-600" />
                  <span>Billing Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start space-x-2">
                  <MapPin size={16} className="text-gray-500 mt-1" />
                  <p className="text-gray-700 text-sm">{billingAddress || 'Not set'}</p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 text-sm"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Update Addresses
                </Button>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Truck size={18} className="text-gray-600" />
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start space-x-2">
                  <MapPin size={16} className="text-gray-500 mt-1" />
                  <p className="text-gray-700 text-sm">{shippingAddress || 'Not set'}</p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 text-sm"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Update Addresses
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 shadow-sm sticky top-6">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Package size={18} className="text-gray-600" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {requirements.map((req) => (
                <div key={req._id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center space-x-2">
                    <Package size={16} className="text-gray-500" />
                    <span className="font-medium text-gray-900 text-sm">{req.productName}</span>
                  </div>
                  <div className="ml-6 mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="text-gray-900">{req.minQty} {req.measurement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-gray-900">₹{formatter.format(req.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST ({req.gstPercentage}%):</span>
                      <span className="text-gray-900">₹{formatter.format((req.amount * req.gstPercentage) / 100)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal:</span>
                  <span className="flex items-center">
                    <IndianRupee size={12} className="mr-1 text-gray-600" />
                    {formatter.format(calculateSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>GST Total:</span>
                  <span className="flex items-center">
                    <IndianRupee size={12} className="mr-1 text-gray-600" />
                    {formatter.format(calculateGST())}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-base text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="flex items-center">
                    <IndianRupee size={14} className="mr-1 text-gray-700" />
                    {formatter.format(calculateTotal())}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Excludes transportation charges.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrdersComponent;