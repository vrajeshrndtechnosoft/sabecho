"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Package, 
  Loader2, 
  AlertCircle,
  Calendar,
  Percent,
  Truck,
  MessageSquare,
  User,
  Mail,
  Phone,
  X,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface User {
  email: string;
  name: string;
  mobile: string;
  companyName?: string;
}

interface Requirement {
  _id: string;
  status: string;
  name: string;
  minQty: number;
  measurement: string;
  amount: number;
  description: string;
  company: string;
  pincode: string;
  reqId: string;
  buyer_email: string;
  mobile: string;
  hsnCode: string;
  gstPercentage: number;
  created_at: string;
  __v: number;
  specification?: string;
  pid?: number; // Made optional since it may not exist
}

interface NegotiationFormData {
  percentage: number | '';
  quantity: number | '';
  deliveryInfo: string;
  additionalInfo: string;
}

interface ValidationErrors {
  percentage?: string;
  quantity?: string;
  deliveryInfo?: string;
}

interface OrderData {
  _id: string;
  status: string;
  productName: string;
  amount: number;
  buyer_email: string;
  commission: number;
  company: string;
  created_at: string;
  description: string;
  gstPercentage: number;
  measurement: string;
  minQty: number;
  mobile: string;
  negotiation: boolean;
  pid: number;
  pincode: string;
  reqId: string;
  seller_email: string;
  hsnCode: string;
  __v: number;
}

interface ProductData {
  _id: string;
  company: string;
  createdAt: string;
  created_at: string;
  email: string;
  gstNo: string;
  measurement: string;
  minQty: number;
  mobile: string;
  name: string;
  pid: number;
  pincode: string;
  reqId: string;
  specification: string;
  status: string;
  userType: string;
  __v: number;
}

interface NegotiationPayloadData {
  SellerEmail: string;
  deliveryRelatedInfo: string;
  messages: string;
  negotiationValue: string;
  previewAmount: number;
  previewQty: number;
  yourQty: string;
  measurement: string;
}

interface NegotiationPayload {
  data: NegotiationPayloadData;
  orderData: OrderData;
  productData: ProductData;
}

const NegotiationDialog: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [formData, setFormData] = useState<NegotiationFormData>({
    percentage: '',
    quantity: '',
    deliveryInfo: '',
    additionalInfo: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3033";
  const router = useRouter();
  const searchParams = useSearchParams();

  const reqId = searchParams.get('id');

  const currentDate = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const fetchRequirement = useCallback(async (id: string, token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/requirements/reqId/${id}`, {
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

      const requirementData: Requirement = await response.json();
      setRequirement(requirementData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch requirement';
      throw new Error(errorMessage);
    }
  }, [API_URL]);

  const verifyTokenAndFetchData = useCallback(async () => {
    if (!reqId) {
      toast.error('No requirement selected for negotiation');
      router.push('/dashboard/tracking');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getCookie('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
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

      const tokenData = await tokenResponse.json();
      if (tokenData.user) {
        setUser(tokenData.user);
      }

      await fetchRequirement(reqId, token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      if (errorMessage.includes('Token') || errorMessage.includes('verification')) {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  }, [reqId, router, fetchRequirement, API_URL]);

  useEffect(() => {
    verifyTokenAndFetchData();
  }, [verifyTokenAndFetchData]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100) {
      errors.percentage = 'Please enter a valid percentage between 1 and 100';
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = 'Please enter a valid quantity greater than 0';
    }
    
    if (!formData.deliveryInfo.trim()) {
      errors.deliveryInfo = 'Delivery information is required';
    } else if (formData.deliveryInfo.trim().length < 10) {
      errors.deliveryInfo = 'Please provide more detailed delivery information (minimum 10 characters)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'percentage' || name === 'quantity' ? (value ? Number(value) : '') : value,
    }));

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmitNegotiation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted with data:', formData); // Debug log
    
    if (submitting) {
      console.log('Already submitting, ignoring...');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    if (!requirement) {
      toast.error('No requirement available for negotiation');
      return;
    }

    // Validate required fields in requirement
    const requiredFields = ['amount', 'buyer_email', 'created_at', 'description', 'gstPercentage', 'hsnCode'];
    const missingFields = requiredFields.filter(field => !requirement[field as keyof Requirement]);
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);

      const token = getCookie('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        router.push('/');
        return;
      }

      const payload: NegotiationPayload = {
        data: {
          SellerEmail: "Sgpvapi@gmail.com",
          deliveryRelatedInfo: formData.deliveryInfo.trim(),
          messages: formData.additionalInfo.trim(),
          negotiationValue: formData.percentage.toString(),
          previewAmount: Number(requirement.amount) || 0, // Ensure it's a valid number
          previewQty: requirement.minQty,
          yourQty: formData.quantity.toString(),
          measurement: requirement.measurement,
        },
        orderData: {
          _id: requirement._id,
          status: requirement.status,
          productName: requirement.name,
          amount: requirement.amount,
          buyer_email: requirement.buyer_email,
          commission: 15,
          company: requirement.company,
          created_at: requirement.created_at,
          description: requirement.description,
          gstPercentage: requirement.gstPercentage,
          measurement: requirement.measurement,
          minQty: requirement.minQty,
          mobile: requirement.mobile,
          negotiation: true,
          pid: requirement.pid || 0, // Use optional chaining with fallback
          pincode: requirement.pincode,
          reqId: requirement.reqId,
          seller_email: "Sgpvapi@gmail.com",
          hsnCode: requirement.hsnCode,
          __v: requirement.__v,
        },
        productData: {
          _id: "684282326401d44897ab6960",
          company: requirement.company,
          createdAt: requirement.created_at,
          created_at: requirement.created_at,
          email: "devcoder2323@gmail.com",
          gstNo: "24ACHFS7557F1ZV",
          measurement: requirement.measurement,
          minQty: requirement.minQty,
          mobile: "9898341345",
          name: requirement.name,
          pid: requirement.pid || 0, // Use optional chaining with fallback
          pincode: "396195",
          reqId: "20250606REQ66250",
          specification: requirement.specification || "6000 units",
          status: "Quoted",
          userType: "buyer",
          __v: requirement.__v,
        },
      };

      const response = await fetch(`${API_URL}/api/v1/negotiation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit negotiation' }));
        throw new Error(errorData.message || 'Failed to submit negotiation');
      }
      
      toast.success('Negotiation offer submitted successfully!');
      router.push('/dashboard/tracking');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit negotiation';
      toast.error(errorMessage);
      console.error('Negotiation submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="flex flex-col items-center space-y-4 text-red-600 bg-red-50 p-6 rounded-lg max-w-md">
          <AlertCircle size={48} />
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Dialog</h2>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Dialog Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Negotiation Request</h2>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/tracking')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-6">
          {/* Date and User Details */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={14} className="mr-1" />
              <span>{currentDate}</span>
            </div>
          </div>

          {user && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User size={18} className="text-blue-600" />
                  <span>Your Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User size={14} className="text-gray-500" />
                    <span className="text-gray-600 font-medium">Name:</span>
                    <span className="text-gray-900">{user.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={14} className="text-gray-500" />
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="text-gray-900">{user.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={14} className="text-gray-500" />
                    <span className="text-gray-600 font-medium">Mobile:</span>
                    <span className="text-gray-900">{user.mobile || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Details */}
          {requirement && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Package size={18} className="text-blue-600" />
                  <span>Product Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">Requirement #{requirement.reqId}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Product Name:</span>
                      <span className="ml-2 text-gray-900">{requirement.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Minimum Quantity:</span>
                      <span className="ml-2 text-gray-900">{requirement.minQty} {requirement.measurement}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Specification:</span>
                      <span className="ml-2 text-gray-900">{requirement.specification || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className="ml-2 text-gray-900 capitalize">{requirement.status || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Negotiation Form */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MessageSquare size={18} className="text-blue-600" />
                <span>Submit Your Offer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitNegotiation} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">Negotiation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="percentage" className="text-sm font-medium text-gray-700">Your Percentage *</Label>
                      <div className="relative mt-1">
                        <Input
                          id="percentage"
                          name="percentage"
                          type="number"
                          min="0.01"
                          max="100"
                          step="0.01"
                          value={formData.percentage}
                          onChange={handleInputChange}
                          placeholder="Enter percentage"
                          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-8 ${validationErrors.percentage ? 'border-red-500' : ''}`}
                          required
                        />
                        <Percent size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                      {validationErrors.percentage && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.percentage}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">Your Quantity *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        step="1"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="Enter quantity"
                        className={`mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${validationErrors.quantity ? 'border-red-500' : ''}`}
                        required
                      />
                      {validationErrors.quantity && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.quantity}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryInfo" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Truck size={14} className="text-blue-600" />
                    <span>Delivery Information *</span>
                  </Label>
                  <Input
                    id="deliveryInfo"
                    name="deliveryInfo"
                    value={formData.deliveryInfo}
                    onChange={handleInputChange}
                    placeholder="Enter delivery information (e.g., address, timeline)"
                    className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${validationErrors.deliveryInfo ? 'border-red-500' : ''}`}
                    required
                  />
                  {validationErrors.deliveryInfo && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.deliveryInfo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">Additional Information (Optional)</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Any additional comments or requirements"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                  />
                </div>

                <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/tracking')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Offer"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NegotiationDialog;