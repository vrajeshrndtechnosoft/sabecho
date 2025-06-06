"use client"

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  FileText, 
  MapPin, 
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

interface TokenResponse {
  email: string
  exp: number
  iat: number
  userId: string
  userType: string
}

interface ProfileData {
  _id: string
  email: string
  name: string
  companyName: string
  mobileNo: string
  gstNo: string
  userType: string
  pincode: string
  createdAt: string
  shippingDetails: string
  profileImage?: string
}

const ProfileComponent: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_URL = process.env.API_URL || "https://sabecho.com"

  useEffect(() => {
    fetchUserProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getCookie('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Verify the token using POST method with token in payload
      const tokenResponse = await fetch(`${API_URL}/api/v1/verifyToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      if (!tokenResponse.ok) {
        throw new Error('Token verification failed')
      }

      const tokenData: TokenResponse = await tokenResponse.json()

      // Fetch profile data using email
      const profileResponse = await fetch(`${API_URL}/api/v1/profile?email=${tokenData.email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile data')
      }

      const profileData: ProfileData = await profileResponse.json()
      setProfileData(profileData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle size={24} />
          <span className="text-lg">{error}</span>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">No profile data available</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Profile Image */}
          <div className="relative">
            {profileData.profileImage ? (
              <Image
                src={`${API_URL}/api/v1/image/${profileData.profileImage}`}
                alt={profileData.name}
                width={50}
                height={50}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
            <p className="text-blue-600 font-medium">{profileData.companyName}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
                {profileData.userType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="mr-2 text-blue-600" size={20} />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profileData.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{profileData.mobileNo}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="font-medium text-gray-900">{profileData.pincode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="mr-2 text-blue-600" size={20} />
            Business Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium text-gray-900">{profileData.companyName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">GST Number</p>
                <p className="font-medium text-gray-900">{profileData.gstNo}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">GST Registration Date</p>
                <p className="font-medium text-gray-900">01/07/2017</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="mr-2 text-blue-600" size={20} />
          Shipping Address
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{profileData.shippingDetails}</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="mr-2 text-blue-600" size={20} />
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Account Created</p>
            <p className="font-medium text-gray-900">{formatDate(profileData.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">User ID</p>
            <p className="font-mono text-sm text-gray-600">{profileData._id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileComponent