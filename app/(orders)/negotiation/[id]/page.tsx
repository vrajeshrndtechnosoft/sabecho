"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner'; // You'll need to install sonner: npm install sonner
import { 
  Package, 
  Loader2, 
  AlertCircle,
  Calendar,
  FileText,
  Percent,
  Truck,
  MessageSquare,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  specification?: string;
  quotationDetails?: {
    status: string;
    minQty: number;
    amount: number;
    measurement: string;
  };
}

interface NegotiationFormData {
  negotiationType: string;
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

const NegotiationComponent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [formData, setFormData] = useState<NegotiationFormData>({
    negotiationType: 'percentage',
    percentage: '',
    quantity: '',
    deliveryInfo: '',
    additionalInfo: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://sabecho.com";
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedIds = searchParams.get('ids')?.split(',') || [];

  // Current date and time for the bill
  const currentDate = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  useEffect(() => {
    if (selectedIds.length === 0) {
      toast.error('No requirements selected for negotiation');
      router.push('/dashboard');
      return;
    }
    verifyTokenAndFetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const verifyTokenAndFetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getCookie('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        router.push('/');
        return;
      }

      // Verify token and get user details
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
      
      // Extract user details from token response
      if (tokenData.user) {
        setUser(tokenData.user);
      }

      // Fetch requirements
      if (selectedIds.length > 0) {
        await fetchRequirements(selectedIds, token);
      } else {
        setRequirements([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If token is invalid, redirect to login
      if (errorMessage.includes('Token') || errorMessage.includes('verification')) {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirements = async (ids: string[], token: string) => {
    try {
      const requirementPromises = ids.map(async (id) => {
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

        return response.json();
      });

      const requirementsData: Requirement[] = await Promise.all(requirementPromises);
      setRequirements(requirementsData);
      
      if (requirementsData.length === 0) {
        toast.warning('No valid requirements found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch requirements';
      throw new Error(errorMessage);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Validate percentage
    if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100) {
      errors.percentage = 'Please enter a valid percentage between 1 and 100';
    }
    
    // Validate quantity
    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = 'Please enter a valid quantity greater than 0';
    }
    
    // Validate delivery info
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

    // Clear validation error for this field
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      negotiationType: value,
    }));
  };

  const handleSubmitNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    if (requirements.length === 0) {
      toast.error('No requirements available for negotiation');
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

      // Prepare payload
      const payload = {
        reqIds: selectedIds,
        negotiationType: formData.negotiationType,
        percentage: Number(formData.percentage),
        quantity: Number(formData.quantity),
        deliveryInfo: formData.deliveryInfo.trim(),
        additionalInfo: formData.additionalInfo.trim(),
        userDetails: user,
        requirements: requirements.map(req => ({
          reqId: req.reqId,
          name: req.name,
          minQty: req.minQty,
          measurement: req.measurement,
          amount: req.amount,
          quotationDetails: req.quotationDetails
        })),
        submittedAt: new Date().toISOString(),
      };

      // Submit negotiation
      const response = await fetch(`${API_URL}/api/v1/negotiations`, {
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
      
      // Redirect to tracking page
      router.push('./dashboard/tracking');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit negotiation';
      toast.error(errorMessage);
      console.error('Negotiation submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4 text-red-600 bg-red-50 p-6 rounded-lg max-w-md">
          <AlertCircle size={48} />
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Page</h2>
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
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg min-h-screen">
      {/* Bill Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Negotiation Request</h1>
            <p className="text-sm text-gray-600 mt-1">Submit Your Offer</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={14} className="mr-1" />
              <span>{currentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Details */}
      {user && (
        <Card className="border-gray-200 shadow-sm mb-6">
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

      {/* Main Content */}
      <div className="space-y-8">
        {/* Product Details */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Package size={18} className="text-blue-600" />
              <span>Product Details ({requirements.length} items)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {requirements.map((req, index) => (
              <div key={req._id} className={`space-y-4 ${index < requirements.length - 1 ? 'border-b border-gray-200 pb-4 mb-4' : ''}`}>
                <h3 className="text-base font-semibold text-gray-900">Requirement #{req.reqId}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Product Name:</span>
                    <span className="ml-2 text-gray-900">{req.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Minimum Quantity:</span>
                    <span className="ml-2 text-gray-900">{req.minQty} {req.measurement}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Specification:</span>
                    <span className="ml-2 text-gray-900">{req.specification || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className="ml-2 text-gray-900 capitalize">{req.status || 'N/A'}</span>
                  </div>
                </div>
                {req.quotationDetails && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <FileText size={14} className="text-blue-600" />
                      <span>Quotation Details</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
                      <div>
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span className="ml-2 text-gray-900 capitalize">{req.quotationDetails.status || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Minimum Quantity:</span>
                        <span className="ml-2 text-gray-900">{req.quotationDetails.minQty} {req.quotationDetails.measurement}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Amount:</span>
                        <span className="ml-2 text-gray-900">₹{formatter.format(req.quotationDetails.amount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Measurement:</span>
                        <span className="ml-2 text-gray-900">{req.quotationDetails.measurement || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {requirements.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No requirements selected for negotiation.</p>
            )}
          </CardContent>
        </Card>

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
              {/* Negotiation Offer */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Negotiation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="negotiationType" className="text-sm font-medium text-gray-700">Negotiation Type</Label>
                    <Select
                      value={formData.negotiationType}
                      onValueChange={handleSelectChange}
                      disabled
                    >
                      <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select negotiation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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

              {/* Delivery Information */}
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

              {/* Additional Information */}
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

              {/* Submit Button */}
              <div className="border-t border-gray-200 pt-6">
                <Button
                  type="submit"
                  disabled={requirements.length === 0 || submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-base py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Offer...
                    </>
                  ) : (
                    "Submit Negotiation Offer"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NegotiationComponent;