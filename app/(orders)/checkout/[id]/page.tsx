"use client"

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  MapPin, 
  Loader2, 
  AlertCircle,
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

// Extend Window interface to include Razorpay
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

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
  negotiationDetails:{
    comment: string;
    customerOfferPriceWithCommission: string;
    negotiationAmount: number;
    negotiationQuantity: number;
    newAmount: number;
    previewAmount: number;
    previewQuantity: number;
  }
  negotiation: boolean;
  pid: number;
  created_at: string;
  __v: number;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface ResponseError {
  error : {
    description: string;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3033";
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoize selectedIds to prevent recreation on every render
  const selectedIds = useMemo(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
    return ids;
  }, [searchParams]);

  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
    return null;
  }, []);

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve(false);
        return;
      }

      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const verifyTokenAndFetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getCookie('token');
      if (!token) {
        router.push('/');
        return;
      }

      const tokenResponse = await fetch(`${API_URL}/api/v1/verifyToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({ message: 'Token verification failed' }));
        throw new Error(errorData.message || 'Token verification failed');
      }

      const tokenData: TokenResponse = await tokenResponse.json();

      const userResponse = await fetch(`${API_URL}/api/v1/profile?email=${encodeURIComponent(tokenData.email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({ message: 'Failed to fetch user details' }));
        throw new Error(errorData.message || 'Failed to fetch user details');
      }

      const userData: UserDetails = await userResponse.json();
      setUser(userData);
      setBillingAddress(userData.billingDetails || '');
      setShippingAddress(userData.shippingDetails || '');
    } catch (err) {
      console.error('Error in verifyTokenAndFetchUser:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // If token is invalid, redirect to login
      if (err instanceof Error && err.message.includes('Token')) {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  }, [getCookie, router, API_URL]);

  const fetchRequirements = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setRequirements([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getCookie('token');
      if (!token) {
        router.push('/');
        return;
      }

      const requirementPromises = ids.map(async (id) => {
        const response = await fetch(`${API_URL}/api/v1/quotaRequirement/${encodeURIComponent(id)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to fetch requirement ${id}` }));
          throw new Error(errorData.message || `Failed to fetch requirement ${id}`);
        }

        return response.json();
      });

      const requirementsData: Requirement[] = await Promise.all(requirementPromises);
      setRequirements(requirementsData.filter(Boolean)); // Filter out any null/undefined results
    } catch (err) {
      console.error('Error in fetchRequirements:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching requirements');
    } finally {
      setLoading(false);
    }
  }, [getCookie, router, API_URL]);

  const displayRazorpay = async () => {
    if (isPaymentLoading) return; // Prevent multiple calls
    
    setIsPaymentLoading(true);
    setError(null);

    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

      if (!res) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      const token = getCookie('token');
      if (!token || !user) {
        throw new Error("User not authenticated. Please log in.");
      }

      if (requirements.length === 0) {
        throw new Error("No items to purchase.");
      }

      const options: RazorpayOptions = {
        key: "rzp_test_4kJGZ6vUcstgUm", // Consider moving to environment variable
        amount: Math.round(total * 100), // Ensure it's an integer
        currency: "INR",
        name: "Sabecho",
        description: "Order Payment",
        image: "https://example.com/your_logo",
        handler: async function (response: RazorpayResponse) {
          try {
            if (!response.razorpay_payment_id) {
              throw new Error("Payment ID not received");
            }

            const saveResponse = await fetch(`${API_URL}/api/payments/savePayment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderDetails: requirements,
                amount: total,
                status: "successful",
                userId: user._id,
                userEmail: user.email,
              }),
            });

            if (!saveResponse.ok) {
              const errorData = await saveResponse.json().catch(() => ({ message: 'Failed to save payment details' }));
              throw new Error(errorData.message || 'Failed to save payment details');
            }

            const saveData = await saveResponse.json();
            
            // Construct the success URL
            const successUrl = `/thankyou/${saveData.paymentDetails?.id || response.razorpay_payment_id}/${requirements[0]._id}`;
            router.push(successUrl);
          } catch (err) {
            console.error('Payment save error:', err);
            setError(err instanceof Error ? err.message : 'Failed to save payment');
            router.push('/payment-failed');
          }
        },
        prefill: {
          name: user?.companyName || user?.name || '',
          email: user?.email || '',
          contact: user?.mobileNo || '',
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            setIsPaymentLoading(false);
            // Don't automatically redirect on dismiss - user might want to try again
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay is not available. Please refresh the page and try again.");
      }

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: ResponseError) {
        console.error('Payment failed:', response);
        setIsPaymentLoading(false);
        setError(`Payment failed: ${response.error?.description || 'Unknown error'}`);
      });

      paymentObject.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      setError(err instanceof Error ? err.message : 'Payment initialization failed');
      setIsPaymentLoading(false);
      
      if (err instanceof Error && err.message.includes('not authenticated')) {
        router.push('/');
      }
    }
  };

  // Separate useEffect for user verification (runs once on mount)
  useEffect(() => {
    verifyTokenAndFetchUser();
  }, [verifyTokenAndFetchUser]);

  // Separate useEffect for requirements (runs when selectedIds change)
  useEffect(() => {
    if (selectedIds.length > 0) {
      fetchRequirements(selectedIds);
    }
  }, [selectedIds, fetchRequirements]);

  const handleAddressUpdate = async () => {
    if (!billingAddress.trim()) {
      setError('Billing address is required');
      return;
    }

    if (!sameAddress && !shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getCookie('token');
      if (!token || !user) {
        throw new Error('User not authenticated');
      }

      const payload = {
        billingAddress: billingAddress.trim(),
        shippingAddress: sameAddress ? billingAddress.trim() : shippingAddress.trim(),
      };

      const response = await fetch(`${API_URL}/api/v1/user/${user._id}/billing`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update addresses' }));
        throw new Error(errorData.message || 'Failed to update addresses');
      }

      await verifyTokenAndFetchUser();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Address update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Memoize calculations to prevent unnecessary recalculations
  const { subtotal, totalGST, total } = useMemo(() => {
    if (requirements.length === 0) {
      return { subtotal: 0, totalGST: 0, total: 0 };
    }

    const subtotal = requirements.reduce((total, req) => {
      const amount = Number(req.negotiationDetails.newAmount) || 0;
      return total + amount;
    }, 0);

    const totalGST = requirements.reduce((totalGST, req) => {
      const amount = Number(req.negotiationDetails.newAmount) || 0;
      const gstPercentage = Number(req.gstPercentage) || 0;
      const gstAmount = (amount * gstPercentage) / 100;
      return totalGST + gstAmount;
    }, 0);

    const total = subtotal + totalGST;

    return { subtotal, totalGST, total };
  }, [requirements]);

  // Early return for no selected items
  if (selectedIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Items Selected</h2>
          <p className="text-gray-600 mb-4">Please select items to checkout.</p>
          <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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

  if (error && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg max-h-screen h-full">
      {/* Address Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Update Addresses</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="billing-address" className="text-sm font-medium text-gray-700">
                Billing Address <span className="text-red-500">*</span>
              </Label>
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping-address" className="text-sm font-medium text-gray-700">
                Shipping Address {!sameAddress && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="shipping-address"
                placeholder="Enter shipping address"
                value={sameAddress ? billingAddress : shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                disabled={loading || sameAddress}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required={!sameAddress}
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
              <Label htmlFor="same-address" className="text-sm text-gray-600">
                Billing and shipping addresses are the same
              </Label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddressUpdate}
              disabled={loading || !billingAddress.trim() || (!sameAddress && !shippingAddress.trim())}
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
      <h1 className="text-xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* User Information */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Billing Details</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700 font-medium">{user?.name || 'N/A'}</p>
            <div className="flex items-start space-x-2">
              <MapPin size={16} className="text-gray-500 mt-1 flex-shrink-0" />
              <p className="text-gray-700">{billingAddress || 'Not set'}</p>
            </div>
            <Button
              variant="link"
              className="text-blue-600 text-sm p-0 h-auto hover:underline"
              onClick={() => setIsDialogOpen(true)}
            >
              Update Address
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Order Summary</h2>
          {requirements.length === 0 ? (
            <p className="text-gray-500 text-sm">No items found</p>
          ) : (
            requirements.map((req) => (
              <div key={req._id} className="space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{req.productName}</span>
                  <span className="text-gray-900">₹{formatter.format(Number(req.negotiationDetails.newAmount) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity: {req.minQty} {req.measurement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST ({req.gstPercentage}%)</span>
                  <span className="text-gray-900">₹{formatter.format((Number(req.negotiationDetails.newAmount) * Number(req.gstPercentage)) / 100 || 0)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span>Subtotal</span>
            <span>₹{formatter.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>GST</span>
            <span>₹{formatter.format(totalGST)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>₹{formatter.format(total)}</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Pay Now */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I accept the terms and conditions
            </label>
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!termsAccepted || isPaymentLoading || requirements.length === 0 || total <= 0}
            onClick={displayRazorpay}
          >
            {isPaymentLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay Now ₹${formatter.format(total)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersComponent;