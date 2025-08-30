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
import {
  Package,
  Scale,
  Truck,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Info,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react"

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Negotiation Form</h2>
              <p className="text-gray-600">Please wait while we fetch the product details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Negotiation Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Submit your best offer and negotiate the perfect deal for your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details Section */}
          <Card className="shadow-xl border-0 h-fit">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-xl flex items-center">
                <Package className="h-6 w-6 mr-2" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Product Name</Label>
                    <p className="text-lg font-semibold text-gray-900 break-words">
                      {productData?.name || "Loading..."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Minimum Quantity</Label>
                    <div className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-blue-600" />
                      <p className="text-lg font-semibold text-gray-900">{productData?.minQty || "Loading..."}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Specification</Label>
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {productData?.specification || "Loading..."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Measurement Unit</Label>
                    <p className="text-lg font-semibold text-gray-900">{productData?.measurement || "Loading..."}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Status</Label>
                    <Badge
                      variant={getStatusBadgeVariant(productData?.status || "")}
                      className="text-sm px-3 py-1 font-medium"
                    >
                      {productData?.status || "Loading..."}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotation Details Section */}
          <Card className="shadow-xl border-0 h-fit">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                Current Quotation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Status</Label>
                    <Badge
                      variant={getStatusBadgeVariant(orderData?.status || "")}
                      className="text-sm px-3 py-1 font-medium"
                    >
                      {orderData?.status || "Loading..."}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Quantity Required</Label>
                    <div className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-green-600" />
                      <p className="text-lg font-semibold text-gray-900">{orderData?.minQty || "Loading..."}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <div className="text-center">
                    <Label className="text-xs font-bold text-green-700 uppercase tracking-wide block mb-2">
                      Current Amount
                    </Label>
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <p className="text-4xl font-bold text-green-600">₹{orderData?.amount || "Loading..."}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Measurement Unit</Label>
                  <p className="text-lg font-semibold text-gray-900">{orderData?.measurement || "Loading..."}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Your Offer Section */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-2xl flex items-center">
              <Send className="h-7 w-7 mr-3" />
              Submit Your Counter Offer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="negotiationType" className="text-sm font-bold text-gray-700">
                    Negotiation Type
                  </Label>
                  <Select value={formData.negotiationType} onValueChange={handleSelectChange}>
                    <SelectTrigger className="h-12 border-2 border-gray-300 focus:border-purple-500">
                      <SelectValue placeholder="Select negotiation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Percentage Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="negotiationValue" className="text-sm font-bold text-gray-700">
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
                      className="h-12 border-2 border-gray-300 focus:border-purple-500 pl-12 text-lg font-semibold"
                      required
                      min="1"
                      max="100"
                      step="0.01"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 font-bold">
                      %
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      Enter the percentage discount you want to negotiate (e.g., 10 for 10% discount from the current
                      price)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="yourQty" className="text-sm font-bold text-gray-700">
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
                      className="h-12 border-2 border-gray-300 focus:border-purple-500 pl-12 text-lg font-semibold"
                      required
                      min="1"
                    />
                    <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-600" />
                  </div>
                  {productData?.minQty && (
                    <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        Minimum quantity required: <strong>{productData.minQty}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="deliveryInfo" className="text-sm font-bold text-gray-700">
                    Delivery Information <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="deliveryInfo"
                      name="deliveryInfo"
                      value={formData.deliveryInfo}
                      onChange={handleInputChange}
                      placeholder="Enter delivery timeline and requirements"
                      className="h-12 border-2 border-gray-300 focus:border-purple-500 pl-12"
                      required
                    />
                    <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="additionalNotes" className="text-sm font-bold text-gray-700">
                  Additional Notes & Terms (Optional)
                </Label>
                <div className="relative">
                  <Textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional terms, conditions, or special requirements..."
                    rows={5}
                    className="border-2 border-gray-300 focus:border-purple-500 pl-12 pt-4 resize-none text-base"
                  />
                  <MessageSquare className="absolute left-3 top-4 h-5 w-5 text-purple-600" />
                </div>
              </div>

              <Separator className="my-8" />

              <div className="text-center">
                <Button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="w-full md:w-auto px-12 h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Submitting Your Offer...
                    </>
                  ) : (
                    <>
                      <Send className="mr-3 h-6 w-6" />
                      Submit Counter Offer
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-600 mt-4">
                  Your offer will be reviewed and you&apos;ll receive a response within 24 hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NegotiationForm
