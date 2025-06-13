"use client"

import { useParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const ThankYouPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { paymentId, orderId } = params;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="mt-2 text-gray-600">Thank you for your purchase.</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Transaction Details</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Product ID:</span> {paymentId}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Order ID:</span> {orderId}
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handlePrint}
            className="inline-block bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors mr-4"
          >
            Print
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;