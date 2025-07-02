"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import { Package, Scale, Truck, MessageSquare, Send, Loader2, AlertCircle, Info } from "lucide-react"

// TypeScript interfaces (keeping the same interfaces as before)
interface OrderData {
  _id: string
  status: string
  productName: string
  commission: number
  minQty: number
  seller_email: string
  amount: number
  description: string
  company: string
  measurement: string
  pincode: string
  reqId: string
  buyer_email: string
  mobile: string
  hsnCode: string
  gstPercentage: number
  negotiation: boolean
  pid: number
  created_at: string
  __v: number
}

interface ProductData {
  _id: string
  name: string
  minQty: number
  company: string
  pincode: string
  gstNo: string
  email: string
  mobile: string
  specification: string
  measurement: string
  userType: string
  status: string
  pid: number
  createdAt: string
  reqId: string
  __v: number
}

interface NegotiationFormData {
  negotiationType: string
  negotiationValue: string
  yourQty: string
  deliveryInfo: string
  additionalNotes: string
}

interface NegotiationSubmissionData {
  data: {
    negotiationValue: string
    yourQty: string
    deliveryRelatedInfo: string
    messages: string
    previewAmount: number
    previewQty: number
    measurement: string
    SellerEmail: string
  }
  productData: ProductData | null
  orderData: OrderData | null
}

const NegotiationForm: React.FC = () => {
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [formData, setFormData] = useState<NegotiationFormData>({
    negotiationType: "Percentage",
    negotiationValue: "",
    yourQty: "",
    deliveryInfo: "",
    additionalNotes: "",
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const searchParams = useSearchParams()
  const reqId = searchParams.get("id")
  const router = useRouter()

  useEffect(() => {
    fetchOrderData()
    fetchProductData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqId])

  const getCookie = useCallback((name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }, [])

  const fetchOrderData = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/v1/quoted-requirements/${reqId}`)
      if (!response.ok) throw new Error("Failed to fetch order data")
      const data: OrderData = await response.json()
      setOrderData(data)
    } catch (error) {
      console.error("Error fetching order data:", error)
      toast.error("Failed to fetch order data. Please try again.")
    }
  }

  const fetchProductData = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/v1/requirements/reqId/${reqId}`)
      if (!response.ok) throw new Error("Failed to fetch product data")
      const data: ProductData = await response.json()
      setProductData(data)
    } catch (error) {
      console.error("Error fetching product data:", error)
      toast.error("Failed to fetch product data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string): void => {
    setFormData((prev) => ({
      ...prev,
      negotiationType: value,
    }))
  }

  const onSubmit = async (): Promise<void> => {
    // Form validation
    if (!formData.negotiationValue || !formData.yourQty || !formData.deliveryInfo) {
      toast.error("Please fill in all required fields.")
      return
    }

    if (!orderData || !productData) {
      toast.error("Product or order data is not available. Please refresh and try again.")
      return
    }

    // Validate negotiation value
    const negotiationValue = Number.parseFloat(formData.negotiationValue)
    if (isNaN(negotiationValue) || negotiationValue <= 0 || negotiationValue > 100) {
      toast.error("Please enter a valid percentage between 1 and 100.")
      return
    }

    // Validate quantity
    const quantity = Number.parseInt(formData.yourQty)
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity greater than 0.")
      return
    }

    setSubmitting(true)

    const negotiationData: NegotiationSubmissionData = {
      data: {
        negotiationValue: formData.negotiationValue,
        yourQty: formData.yourQty,
        deliveryRelatedInfo: formData.deliveryInfo,
        messages: formData.additionalNotes,
        previewAmount: orderData.amount,
        previewQty: Number.parseInt(formData.yourQty),
        measurement: productData.measurement,
        SellerEmail: orderData.seller_email,
      },
      productData,
      orderData,
    }

    const token = getCookie("token")

    try {
      const response = await fetch(`/api/v1/negotiation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(negotiationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit negotiation")
      }

      toast.success("Negotiation submitted successfully!")

      // Reset form
      setFormData({
        negotiationType: "Percentage",
        negotiationValue: "",
        yourQty: "",
        deliveryInfo: "",
        additionalNotes: "",
      })

      router.push("/dashboard/tracking")
    } catch (error) {
      console.error("Error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit negotiation. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-8 sm:h-12 bg-gray-200 rounded-lg"></div>
            <div className="grid gap-4 sm:gap-6">
              <div className="h-48 sm:h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-48 sm:h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-64 sm:h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Negotiation Form</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">Submit your offer and negotiate the best deal</p>
        </div>

        {/* Product Details Section */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-800">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Product Name
                </Label>
                <p className="text-base sm:text-lg font-medium text-gray-900 break-words">
                  {productData?.name || "Loading..."}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Minimum Quantity
                </Label>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <p className="text-base sm:text-lg font-medium text-gray-900">
                    {productData?.minQty || "Loading..."}
                  </p>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Specification
                </Label>
                <p className="text-sm sm:text-base text-gray-900 bg-gray-50 p-3 rounded-lg break-words">
                  {productData?.specification || "Loading..."}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Measurement Unit
                </Label>
                <p className="text-base sm:text-lg font-medium text-gray-900">
                  {productData?.measurement || "Loading..."}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Status</Label>
                <Badge
                  variant={getStatusBadgeVariant(productData?.status || "")}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                >
                  {productData?.status || "Loading..."}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Details Section */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-800">
              Quotation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Status</Label>
                <Badge
                  variant={getStatusBadgeVariant(orderData?.status || "")}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                >
                  {orderData?.status || "Loading..."}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Minimum Quantity
                </Label>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <p className="text-base sm:text-lg font-medium text-gray-900">{orderData?.minQty || "Loading..."}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Amount</Label>
                <div className="flex items-center gap-2">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">₹{orderData?.amount || "Loading..."}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Measurement Unit
                </Label>
                <p className="text-base sm:text-lg font-medium text-gray-900">
                  {orderData?.measurement || "Loading..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Your Offer Section */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-800">
              <Send className="h-5 w-5 sm:h-6 sm:w-6" />
              Submit Your Offer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="negotiationType" className="text-sm font-medium text-gray-700">
                  Negotiation Type
                </Label>
                <Select value={formData.negotiationType} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full h-10 sm:h-12 border border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="Select negotiation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="negotiationValue" className="text-sm font-medium text-gray-700">
                  Your Offer Percentage <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="negotiationValue"
                    name="negotiationValue"
                    type="number"
                    value={formData.negotiationValue}
                    onChange={handleInputChange}
                    placeholder="Enter percentage (1-100)"
                    className="h-10 sm:h-12 border border-gray-300 focus:border-blue-500 pl-10"
                    required
                    min="1"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                  <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Enter the percentage you want to negotiate (e.g., 10 for 10% discount)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yourQty" className="text-sm font-medium text-gray-700">
                  Your Quantity <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="yourQty"
                    name="yourQty"
                    type="number"
                    value={formData.yourQty}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    className="h-10 sm:h-12 border border-gray-300 focus:border-blue-500 pl-10"
                    required
                    min="1"
                  />
                  <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {productData?.minQty && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Minimum quantity required: {productData.minQty}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryInfo" className="text-sm font-medium text-gray-700">
                  Delivery Information <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="deliveryInfo"
                    name="deliveryInfo"
                    value={formData.deliveryInfo}
                    onChange={handleInputChange}
                    placeholder="Enter delivery information"
                    className="h-10 sm:h-12 border border-gray-300 focus:border-blue-500 pl-10"
                    required
                  />
                  <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700">
                  Additional Notes (Optional)
                </Label>
                <div className="relative">
                  <Textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional notes..."
                    rows={4}
                    className="border border-gray-300 focus:border-blue-500 pl-10 pt-3 resize-none"
                  />
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <Separator className="my-4 sm:my-6" />

              <Button
                onClick={onSubmit}
                disabled={submitting}
                className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm sm:text-base rounded-lg shadow-sm transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Submitting Offer...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Submit Offer
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NegotiationForm
