"use client"

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const PaymentFailedPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment Failed</h1>
        </div>
        <div className="text-center">
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

export default PaymentFailedPage;