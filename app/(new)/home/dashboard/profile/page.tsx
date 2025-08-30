"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  Building,
  FileText,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Edit,
  Camera,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<ProfileData>>({})
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getCookie("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const tokenResponse = await fetch(`/api/v1/auth/verifyToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Token verification failed")
      }

      const tokenData: TokenResponse = await tokenResponse.json()

      const profileResponse = await fetch(`/api/v1/users/profile?email=${tokenData.email}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch profile data")
      }

      const profileData: ProfileData = await profileResponse.json()
      setProfileData(profileData)
      setEditFormData({
        name: profileData.name,
        email: profileData.email,
        companyName: profileData.companyName,
        mobileNo: profileData.mobileNo,
        gstNo: profileData.gstNo,
        pincode: profileData.pincode,
        shippingDetails: profileData.shippingDetails,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0])
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const formData = new FormData()
      formData.append("userId", profileData!._id)

      Object.entries(editFormData).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile)
      }

      const response = await fetch("/api/v1/users/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      setProfileData((prev) => ({
        ...prev!,
        ...editFormData,
        profileImage: data.user.profileImage || prev!.profileImage,
      }))

      setIsEditModalOpen(false)
      setProfileImageFile(null)
      toast.success("Profile updated successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred while updating profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3 text-orange-500">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="max-w-md">
          <CardContent className="flex items-center space-x-3 text-red-600 p-6">
            <AlertCircle size={24} />
            <span className="text-lg">{error}</span>
          </CardContent>
        </Card>
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
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-50 to-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="relative">
              {profileData.profileImage ? (
                <Image
                  src={`/api/v1/image/${profileData.profileImage}`}
                  alt={profileData.name}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full object-cover border-4 border-orange-200 shadow-lg"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <User size={40} className="text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name}</h1>
              <p className="text-xl text-orange-600 font-semibold mb-3">{profileData.companyName}</p>
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 capitalize px-3 py-1">
                  {profileData.userType}
                </Badge>
                <Badge className="bg-green-100 text-green-800 px-3 py-1">Active</Badge>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-2 border-orange-300 text-orange-600 hover:bg-orange-50 px-6 py-3"
              size="lg"
            >
              <Edit size={18} />
              <span>Edit Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <Mail className="mr-2" size={20} />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profileData.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{profileData.mobileNo}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="font-medium text-gray-900">{profileData.pincode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <Building className="mr-2" size={20} />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Building size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium text-gray-900">{profileData.companyName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FileText size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">GST Number</p>
                <p className="font-medium text-gray-900">{profileData.gstNo}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">GST Registration Date</p>
                <p className="font-medium text-gray-900">01/07/2017</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-600">
            <MapPin className="mr-2" size={20} />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">{profileData.shippingDetails}</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-600">
            <User className="mr-2" size={20} />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Account Created</p>
              <p className="font-medium text-gray-900">{formatDate(profileData.createdAt)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-mono text-sm text-gray-600">{profileData._id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleEditInputChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editFormData.email || ""}
                  onChange={handleEditInputChange}
                  placeholder="Your email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={editFormData.companyName || ""}
                  onChange={handleEditInputChange}
                  placeholder="Your company name"
                />
              </div>

              <div>
                <Label htmlFor="mobileNo">Mobile Number</Label>
                <Input
                  id="mobileNo"
                  name="mobileNo"
                  value={editFormData.mobileNo || ""}
                  onChange={handleEditInputChange}
                  placeholder="Your mobile number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gstNo">GST Number</Label>
                <Input
                  id="gstNo"
                  name="gstNo"
                  value={editFormData.gstNo || ""}
                  onChange={handleEditInputChange}
                  placeholder="Your GST number"
                />
              </div>

              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={editFormData.pincode || ""}
                  onChange={handleEditInputChange}
                  placeholder="Your pincode"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="shippingDetails">Shipping Address</Label>
              <Textarea
                id="shippingDetails"
                name="shippingDetails"
                value={editFormData.shippingDetails || ""}
                onChange={handleEditInputChange}
                placeholder="Your shipping address"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="profileImage">Profile Image</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                <Camera className="text-gray-400" size={20} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProfileComponent
