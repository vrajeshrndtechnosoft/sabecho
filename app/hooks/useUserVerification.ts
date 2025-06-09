import { useState, useCallback } from 'react';

// Define interfaces for type safety
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
  shippingDetails: string;
  tradeNam: string;
  profileImage: string;
  userId: string;
  billingDetails: string;
  createdAt: string;
}

interface VerifyTokenResponse {
  success: boolean;
  email?: string;
  message?: string;
}

export const useAuthUser = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.API_URL || "http://localhost:3033";

  const verifyAndFetchUser = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Verifying token:', token); // Debug log
      // Step 1: Verify token
      const verifyResponse = await fetch(`${API_URL}/api/v1/verifyToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(`Token verification failed: ${errorData.message || verifyResponse.statusText} (Status: ${verifyResponse.status})`);
      }

      const verifyData: VerifyTokenResponse = await verifyResponse.json();
      console.log('Token verification response:', verifyData); // Debug log
      
      if (!verifyData.success || !verifyData.email) {
        throw new Error(verifyData.message || 'Invalid token');
      }

      // Step 2: Fetch user details
      console.log('Fetching profile for email:', verifyData.email); // Debug log
      const profileResponse = await fetch(
        `${API_URL}/api/v1/profile?email=${encodeURIComponent(verifyData.email)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({}));
        throw new Error(`Failed to fetch user details: ${errorData.message || profileResponse.statusText} (Status: ${profileResponse.status})`);
      }

      const userData: UserDetails = await profileResponse.json();
      console.log('Fetched user details:', userData); // Debug log
      setUserDetails(userData);
      return userData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error in verifyAndFetchUser:', errorMessage); // Debug log
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  return { userDetails, isLoading, error, verifyAndFetchUser };
};