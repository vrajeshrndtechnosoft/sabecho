"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';

// TypeScript interfaces
interface OrderData {
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

interface ProductData {
  _id: string;
  name: string;
  minQty: number;
  company: string;
  pincode: string;
  gstNo: string;
  email: string;
  mobile: string;
  specification: string;
  measurement: string;
  userType: string;
  status: string;
  pid: number;
  createdAt: string;
  reqId: string;
  __v: number;
}

interface NegotiationFormData {
  negotiationType: string;
  negotiationValue: string;
  yourQty: string;
  deliveryInfo: string;
  additionalNotes: string;
}

interface NegotiationSubmissionData {
  data: {
    negotiationValue: string;
    yourQty: string;
    deliveryRelatedInfo: string;
    messages: string;
    previewAmount: number;
    previewQty: number;
    measurement: string;
    SellerEmail: string;
  };
  productData: ProductData | null;
  orderData: OrderData | null;
}

const NegotiationForm: React.FC = () => {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [formData, setFormData] = useState<NegotiationFormData>({
    negotiationType: 'Percentage',
    negotiationValue: '',
    yourQty: '',
    deliveryInfo: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const searchParams = useSearchParams();
  // Sample reqId - in real app this would come from props or URL params
  const reqId = searchParams.get('id');
  const router = useRouter();
  const API_URL = process.env.API_URL || "http://localhost:3033";

  useEffect(() => {
    fetchOrderData();
    fetchProductData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqId]);

  const getCookie = useCallback((name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }, []);

  const fetchOrderData = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/quotaRequirement/${reqId}`);
      if (!response.ok) throw new Error('Failed to fetch order data');
      const data: OrderData = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error("Error fetching order data:", error);
      toast.error("Failed to fetch order data. Please try again.");
    }
  };

  const fetchProductData = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/requirements/reqId/${reqId}`);
      if (!response.ok) throw new Error('Failed to fetch product data');
      const data: ProductData = await response.json();
      setProductData(data);
    } catch (error) {
      console.error("Error fetching product data:", error);
      toast.error("Failed to fetch product data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (): Promise<void> => {
    // Form validation
    if (!formData.negotiationValue || !formData.yourQty || !formData.deliveryInfo) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!orderData || !productData) {
      toast.error("Product or order data is not available. Please refresh and try again.");
      return;
    }

    setSubmitting(true);

    const negotiationData: NegotiationSubmissionData = {
      data: {
        negotiationValue: formData.negotiationValue,
        yourQty: formData.yourQty,
        deliveryRelatedInfo: formData.deliveryInfo,
        messages: formData.additionalNotes,
        previewAmount: orderData.amount,
        previewQty: orderData.minQty,
        measurement: productData.measurement,
        SellerEmail: orderData.seller_email
      },
      productData,
      orderData
    };

    const token = getCookie('token');

    try {
      const response = await fetch(`${API_URL}/api/v1/negotiation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(negotiationData)
      });

      if (!response.ok) throw new Error('Failed to submit negotiation');

      const result = await response.json();
      console.log("Success:", result);
      router.push('/dashboard/tracking')
      toast.success("Negotiation submitted successfully!");
      
      // Reset form
      setFormData({
        negotiationType: 'Percentage',
        negotiationValue: '',
        yourQty: '',
        deliveryInfo: '',
        additionalNotes: ''
      });

    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit negotiation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Negotiation Form</h1>

      {/* Product Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <p className="text-gray-900 mt-1">{productData?.name || 'Loading...'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Min Qty:</span>
              <p className="text-gray-900 mt-1">{productData?.minQty || 'Loading...'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Specification:</span>
              <p className="text-gray-900 mt-1">{productData?.specification || 'Loading...'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Measurement:</span>
              <p className="text-gray-900 mt-1">{productData?.measurement || 'Loading...'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                {productData?.status || 'Loading...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotation Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Quotation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                {orderData?.status || 'Loading...'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Min Qty:</span>
              <p className="text-gray-900 mt-1">{orderData?.minQty || 'Loading...'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Amount:</span>
              <p className="text-gray-900 mt-1">₹{orderData?.amount || 'Loading...'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Measurement:</span>
              <p className="text-gray-900 mt-1">{orderData?.measurement || 'Loading...'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Your Offer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Submit Your Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negotiation Type
              </label>
              <select
                name="negotiationType"
                value={formData.negotiationType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Percentage">Percentage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Offer Percentage <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="negotiationValue"
                value={formData.negotiationValue}
                onChange={handleInputChange}
                placeholder="Enter percentage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="yourQty"
                value={formData.yourQty}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Information <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="deliveryInfo"
                value={formData.deliveryInfo}
                onChange={handleInputChange}
                placeholder="Enter delivery information"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NegotiationForm;