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
  Search,
  Hash,
  IndianRupee,
  CheckCircle,
  Send
} from 'lucide-react';

// Utility Components
const Input = ({ value, onChange, placeholder, className = "", type = "text", ...props }: any) => {
  if (props.withSearch) {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${className}`}
          {...props}
        />
      </div>
    );
  }
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${className}`}
      {...props}
    />
  );
};

const Button = ({ onClick, children, className = "", variant = "primary", disabled = false, ...props }: any) => {
  const baseClasses = "px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Label = ({ htmlFor, children, className = "" }: any) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: any) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: any) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }: any) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Textarea = ({ value, onChange, placeholder, className = "", rows = 3, ...props }: any) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full resize-vertical ${className}`}
    {...props}
  />
);

const InfoRow = ({ icon, label, value }: any) => (
  <div className="flex items-center mb-2">
    {icon}
    <span className="font-semibold mr-2 ml-2">{label}:</span>
    <span className="text-gray-700">{value || 'N/A'}</span>
  </div>
);

// Interfaces
interface User {
  email: string;
  name: string;
  mobile: string;
  companyName?: string;
  userType: string;
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
  pid?: number;
}

interface NegotiationData {
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
  negotiation: Array<{
    negId: string;
    yourAmount: number;
    yourQty: number;
    previewAmount: number;
    previewQty: number;
    deliveryRelatedInfo: string;
    messages: string;
    createdAt: string;
  }>;
  pid: number;
  pincode: string;
  reqId: string;
  seller_email: string;
  hsnCode: string;
  __v: number;
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

// Negotiation Card Component
const NegotiationCard = ({ data, onClose, onSendNegotiation, onUpdateStatus, onSendToCustomer }: any) => {
  const [newAmount, setNewAmount] = useState('');
  const [newStatus, setNewStatus] = useState(data.status);
  const negotiation = data.negotiation?.[0] || {};

  const handleSendNegotiation = () => {
    const negotiationData = {
      productDetails: {
        productName: data.productName,
        productId: data.pid,
        hsnCode: data.hsnCode,
        measurement: data.measurement,
        gst: `${data.gstPercentage}%`
      },
      sellerInfo: {
        email: data.seller_email
      },
      requestInfo: {
        requestId: data.reqId,
        createdAt: data.created_at
      },
      negotiationDetails: {
        negotiationId: negotiation.negId || '',
        negotiationAmount: newAmount ? Number(newAmount) : negotiation.yourAmount || 0,
        negotiationQuantity: negotiation.yourQty || 0,
        previewAmount: negotiation.previewAmount || 0,
        previewQuantity: negotiation.previewQty || 0
      },
      additionalInfo: {
        deliveryInfo: negotiation.deliveryRelatedInfo || '',
        description: data.description || ''
      },
      status: newStatus
    };

    onSendNegotiation(negotiationData);
  };

  const handleStatusUpdate = () => {
    onUpdateStatus(data._id, newStatus);
  };

  const handleSendToCustomer = () => {
    onSendToCustomer(data._id, newAmount ? Number(newAmount) : negotiation.yourAmount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">{data.productName || 'N/A'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <InfoRow icon={<Package className="w-5 h-5" />} label="Product ID" value={data.pid} />
            <InfoRow icon={<Hash className="w-5 h-5" />} label="HSN Code" value={data.hsnCode} />
            <InfoRow icon={<IndianRupee className="w-5 h-5" />} label="Amount" value={`₹${data.amount || 0}`} />
            <InfoRow icon={<Package className="w-5 h-5" />} label="Min Quantity" value={data.minQty} />
            <InfoRow icon={<IndianRupee className="w-5 h-5" />} label="Commission" value={`${data.commission || 0}%`} />
            <InfoRow icon={<Package className="w-5 h-5" />} label="Measurement" value={data.measurement} />
            <InfoRow icon={<IndianRupee className="w-5 h-5" />} label="GST" value={`${data.gstPercentage || 0}%`} />
          </div>
          <div>
            <InfoRow icon={<Mail className="w-5 h-5" />} label="Seller Email" value={data.seller_email} />
            <InfoRow icon={<Mail className="w-5 h-5" />} label="Buyer Email" value={data.buyer_email} />
            <InfoRow icon={<Hash className="w-5 h-5" />} label="Request ID" value={data.reqId} />
            <InfoRow icon={<Package className="w-5 h-5" />} label="Company" value={data.company} />
            <InfoRow icon={<Hash className="w-5 h-5" />} label="Pincode" value={data.pincode} />
            <InfoRow icon={<Hash className="w-5 h-5" />} label="Mobile" value={data.mobile} />
            <InfoRow icon={<Calendar className="w-5 h-5" />} label="Created At" value={data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'} />
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Negotiation Details</h3>
          <div className="bg-gray-100 p-4 rounded-md">
            <InfoRow icon={<Hash className="w-5 h-5" />} label="Negotiation ID" value={negotiation.negId} />
            <InfoRow icon={<IndianRupee className="w-5 h-5" />} label="Negotiation Amount" value={`₹${negotiation.yourAmount || 0}`} />
            <InfoRow icon={<Package className="w-5 h-5" />} label="Negotiation Quantity" value={negotiation.yourQty || 0} />
            <InfoRow icon={<IndianRupee className="w-5 h-5" />} label="Preview Amount" value={`₹${negotiation.previewAmount || 0}`} />
            <InfoRow icon={<Package className="w-5 h-5" />} label="Preview Quantity" value={negotiation.previewQty || 0} />
            <InfoRow icon={<Truck className="w-5 h-5" />} label="Delivery Info" value={negotiation.deliveryRelatedInfo} />
            <InfoRow icon={<MessageSquare className="w-5 h-5" />} label="Messages" value={negotiation.messages} />
            <InfoRow icon={<Calendar className="w-5 h-5" />} label="Created At" value={negotiation.createdAt ? new Date(negotiation.createdAt).toLocaleString() : 'N/A'} />
            
            <div className="mt-4">
              <Label htmlFor="newAmount">New Negotiation Amount</Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e: any) => setNewAmount(e.target.value)}
                  placeholder="Enter new amount"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Status Update</h3>
          <div className="flex items-center space-x-4">
            <select
              value={newStatus}
              onChange={(e: any) => setNewStatus(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button onClick={handleStatusUpdate} className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" /> Update Status
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button onClick={handleSendNegotiation} className="flex items-center">
            <Send className="w-5 h-5 mr-2" /> Send Negotiation
          </Button>
          <Button onClick={handleSendToCustomer} className="flex items-center">
            <Mail className="w-5 h-5 mr-2" /> Send to Customer
          </Button>
        </div>
      </div>
    </div>
  );
};

const NegotiationDialog = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [negotiationData, setNegotiationData] = useState<NegotiationData[]>([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState<NegotiationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [showNegotiationList, setShowNegotiationList] = useState(false);
  
  const API_URL = "http://localhost:3033";
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

  const fetchNegotiationData = useCallback(async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_URL}/api/v1/negotiationAll`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch negotiation data' }));
        throw new Error(errorData.message || 'Failed to fetch negotiation data');
      }

      const data = await response.json();
      setNegotiationData(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch negotiation data';
      console.error('Negotiation data fetch error:', err);
      toast.error(errorMessage);
    }
  }, [API_URL]);

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

      const requirementData = await response.json();
      setRequirement(requirementData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch requirement';
      throw new Error(errorMessage);
    }
  }, [API_URL]);

  const verifyTokenAndFetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getCookie('token');
      const userType = getCookie('userType');
      
      if (!token) {
        throw new Error('Authentication required. Please login again.');
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
        setUser({ ...tokenData.user, userType: userType || 'buyer' });
      }

      await fetchNegotiationData();

      if (reqId) {
        await fetchRequirement(reqId, token);
      } else {
        setShowNegotiationList(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [reqId, fetchRequirement, fetchNegotiationData, API_URL]);

  useEffect(() => {
    verifyTokenAndFetchData();
  }, [verifyTokenAndFetchData]);

  const validateForm = () => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    if (submitting) return;

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    if (!requirement) {
      toast.error('No requirement available for negotiation');
      return;
    }

    try {
      setSubmitting(true);

      const token = getCookie('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const payload = {
        data: {
          SellerEmail: "Sgpvapi@gmail.com",
          deliveryRelatedInfo: formData.deliveryInfo.trim(),
          messages: formData.additionalInfo.trim(),
          negotiationValue: formData.percentage.toString(),
          previewAmount: Number(requirement.amount) || 0,
          previewQty: requirement.minQty || 0,
          yourQty: formData.quantity.toString(),
          measurement: requirement.measurement || '',
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
          pid: requirement.pid || 0,
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
          pid: requirement.pid || 0,
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
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit negotiation';
      toast.error(errorMessage);
      console.error('Negotiation submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardClick = (negotiation: NegotiationData) => {
    setSelectedNegotiation(negotiation);
  };

  const handleCloseModal = () => {
    setSelectedNegotiation(null);
  };

  const handleSendNegotiation = async (negotiationData: any) => {
    try {
      const token = getCookie('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/negotiation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(negotiationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send negotiation' }));
        throw new Error(errorData.message || 'Failed to send negotiation');
      }

      toast.success('Negotiation sent successfully!');
      handleCloseModal();
      await fetchNegotiationData();
    } catch (error) {
      console.error("Failed to send negotiation:", error);
      toast.error('Failed to send negotiation');
    }
  };

  const handleStatusUpdate = async (quotationId: string, newStatus: string) => {
    try {
      const token = getCookie('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/admin/quotations/${quotationId}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Status updated successfully');
      await fetchNegotiationData();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error('Failed to update status');
    }
  };

  const handleSendToCustomer = async (quotationId: string, amount: number) => {
    try {
      const token = getCookie('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/admin/quotations/${quotationId}/sendToCustomer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to send to customer');
      }

      toast.success('Sent to customer successfully');
    } catch (error) {
      console.error("Failed to send to customer:", error);
      toast.error('Failed to send to customer');
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
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showNegotiationList && !reqId) {
    const filteredData = negotiationData.filter((negotiation) =>
      negotiation.productName?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    );

    return (
      <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Admin Customer Negotiations</h1>
              <Button
                variant="ghost"
                onClick={() => setShowNegotiationList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="p-6 border-b border-gray-200">
              <Input
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                placeholder="Search by Product Name"
                withSearch
                className="w-full"
              />
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.length > 0 ? (
                  filteredData.map((negotiation) => (
                    <Card 
                      key={negotiation._id}
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onClick={() => handleCardClick(negotiation)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center justify-between">
                          <span className="truncate">{negotiation.productName || 'N/A'}</span>
                          <Badge variant={negotiation.status || 'default'}>{negotiation.status || 'Unknown'}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <InfoRow 
                            icon={<Hash className="w-4 h-4 text-gray-500" />}
                            label="Request ID"
                            value={negotiation.reqId}
                          />
                          <InfoRow 
                            icon={<IndianRupee className="w-4 h-4 text-gray-500" />}
                            label="Amount"
                            value={`₹${negotiation.amount || 0}`}
                          />
                          <InfoRow 
                            icon={<Package className="w-4 h-4 text-gray-500" />}
                            label="Quantity"
                            value={`${negotiation.minQty || 0} ${negotiation.measurement || ''}`}
                          />
                          <InfoRow 
                            icon={<Calendar className="w-4 h-4 text-gray-500" />}
                            label="Created"
                            value={negotiation.created_at ? new Date(negotiation.created_at).toLocaleDateString() : 'N/A'}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No negotiations found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={14} className="mr-1" />
              <span>{currentDate}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowNegotiationList(true)}
              className="flex items-center"
            >
              <Package className="w-4 h-4 mr-2" />
              View All Negotiations
            </Button>
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
                  <InfoRow 
                    icon={<User className="w-4 h-4 text-gray-500" />}
                    label="Name"
                    value={user.name}
                  />
                  <InfoRow 
                    icon={<Mail className="w-4 h-4 text-gray-500" />}
                    label="Email"
                    value={user.email}
                  />
                  <InfoRow 
                    icon={<Phone className="w-4 h-4 text-gray-500" />}
                    label="Mobile"
                    value={user.mobile}
                  />
                </div>
              </CardContent>
            </Card>
          )}

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
                    <InfoRow 
                      icon={<Package className="w-4 h-4 text-gray-500" />}
                      label="Product Name"
                      value={requirement.name}
                    />
                    <InfoRow 
                      icon={<Package className="w-4 h-4 text-gray-500" />}
                      label="Quantity"
                      value={`${requirement.minQty} ${requirement.measurement}`}
                    />
                    <InfoRow 
                      icon={<MessageSquare className="w-4 h-4 text-gray-500" />}
                      label="Specification"
                      value={requirement.specification}
                    />
                    <InfoRow 
                      icon={<Badge className="w-4 h-4 text-gray-500" />}
                      label="Status"
                      value={requirement.status}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                      <Label htmlFor="percentage">Your Percentage *</Label>
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
                          className={validationErrors.percentage ? 'border-red-500' : ''}
                          required
                        />
                        <Percent size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                      {validationErrors.percentage && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.percentage}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="quantity">Your Quantity *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        step="1"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="Enter quantity"
                        className={validationErrors.quantity ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.quantity && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.quantity}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryInfo" className="flex items-center space-x-2">
                    <Truck size={14} className="text-blue-600" />
                    <span>Delivery Information *</span>
                  </Label>
                  <Input
                    id="deliveryInfo"
                    name="deliveryInfo"
                    value={formData.deliveryInfo}
                    onChange={handleInputChange}
                    placeholder="Enter delivery information (e.g., address, timeline)"
                    className={validationErrors.deliveryInfo ? 'border-red-500' : ''}
                    required
                  />
                  {validationErrors.deliveryInfo && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.deliveryInfo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Any additional comments or requirements"
                    rows={4}
                  />
                </div>

                <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/tracking')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Offer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedNegotiation && (
        <NegotiationCard
          data={selectedNegotiation}
          onClose={handleCloseModal}
          onSendNegotiation={handleSendNegotiation}
          onUpdateStatus={handleStatusUpdate}
          onSendToCustomer={handleSendToCustomer}
        />
      )}
    </div>
  );
};    

export default NegotiationDialog;