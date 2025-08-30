"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Loader2, AlertCircle, CreditCard, Package, Shield, CheckCircle, User, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Extend Window interface to include Razorpay
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

interface TokenResponse {
  email: string
  name: string
  userId: string
  userType: string
}

interface UserDetails {
  _id: string
  email: string
  name: string
  companyName: string
  mobileNo: string
  gstNo: string
  userType: string
  pincode: string
  verify: boolean
  nba: string[]
  shippingDetails: string
  sts: string
  tradeNam: string
  profileImage: string
  userId: string
  billingDetails: string
}

interface Requirement {
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
  negotiationDetails?: {
    comment: string
    customerOfferPriceWithCommission: string
    negotiationAmount: number
    negotiationQuantity: number
    newAmount: number
    previewAmount: number
    previewQuantity: number
  }
  negotiation: boolean
  pid: number
  created_at: string
  __v: number
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

interface ResponseError {
  error: {
    description: string
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  image?: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  modal: {
    ondismiss: () => void
  }
}

const OrdersComponent: React.FC = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [user, setUser] = useState<UserDetails | null>(null)
  const [billingAddress, setBillingAddress] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [sameAddress, setSameAddress] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Memoize selectedIds to prevent recreation on every render
  const selectedIds = useMemo(() => {
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || []
    return ids
  }, [searchParams])

  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // Helper function to get the correct amount
  const getAmount = useCallback((req: Requirement): number => {
    if (req.negotiationDetails && req.negotiationDetails.newAmount) {
      return Number(req.negotiationDetails.newAmount)
    }
    return Number(req.amount)
  }, [])

  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift()
      return cookieValue || null
    }
    return null
  }, [])

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof document === "undefined") {
        resolve(false)
        return
      }
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`)
      if (existingScript) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = src
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const verifyTokenAndFetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const token = getCookie("token")
      if (!token) {
        router.push("/")
        return
      }

      const tokenResponse = await fetch(`/api/v1/auth/verifyToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({ message: "Token verification failed" }))
        throw new Error(errorData.message || "Token verification failed")
      }

      const tokenData: TokenResponse = await tokenResponse.json()

      const userResponse = await fetch(`/api/v1/users/profile?email=${tokenData.email}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({ message: "Failed to fetch user details" }))
        throw new Error(errorData.message || "Failed to fetch user details")
      }

      const userData: UserDetails = await userResponse.json()
      setUser(userData)
      setBillingAddress(userData.billingDetails || "")
      setShippingAddress(userData.shippingDetails || "")
    } catch (err) {
      console.error("Error in verifyTokenAndFetchUser:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      // If token is invalid, redirect to login
      if (err instanceof Error && err.message.includes("Token")) {
        router.push("/")
      }
    } finally {
      setLoading(false)
    }
  }, [getCookie, router])

  const fetchRequirements = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) {
        setRequirements([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const token = getCookie("token")
        if (!token) {
          router.push("/")
          return
        }

        const requirementPromises = ids.map(async (id) => {
          const response = await fetch(`/api/v1/quoted-requirements/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Failed to fetch requirement ${id}` }))
            throw new Error(errorData.message || `Failed to fetch requirement ${id}`)
          }

          return response.json()
        })

        const requirementsData: Requirement[] = await Promise.all(requirementPromises)
        setRequirements(requirementsData.filter(Boolean)) // Filter out any null/undefined results
      } catch (err) {
        console.error("Error in fetchRequirements:", err)
        setError(err instanceof Error ? err.message : "An error occurred while fetching requirements")
      } finally {
        setLoading(false)
      }
    },
    [getCookie, router],
  )

  const displayRazorpay = async () => {
    if (isPaymentLoading) return // Prevent multiple calls
    setIsPaymentLoading(true)
    setError(null)

    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")
      if (!res) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.")
      }

      const token = getCookie("token")
      if (!token || !user) {
        throw new Error("User not authenticated. Please log in.")
      }

      if (requirements.length === 0) {
        throw new Error("No items to purchase.")
      }

      const options: RazorpayOptions = {
        key: "rzp_test_4kJGZ6vUcstgUm", // Consider moving to environment variable
        amount: Math.round(total * 100), // Ensure it's an integer
        currency: "INR",
        name: "Sabecho",
        description: "Order Payment",
        image: "https://example.com/your_logo",
        handler: async (response: RazorpayResponse) => {
          try {
            if (!response.razorpay_payment_id) {
              throw new Error("Payment ID not received")
            }

            const saveResponse = await fetch(`/api/v1/payment/save-payment`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderDetails: requirements,
                amount: total,
                status: "successful",
                userId: user._id,
                userEmail: user.email,
              }),
            })

            if (!saveResponse.ok) {
              const errorData = await saveResponse.json().catch(() => ({ message: "Failed to save payment details" }))
              throw new Error(errorData.message || "Failed to save payment details")
            }

            const saveData = await saveResponse.json()
            // Construct the success URL
            const successUrl = `/thankyou/${saveData.paymentDetails?.id || response.razorpay_payment_id}/${requirements[0]._id}`
            router.push(successUrl)
          } catch (err) {
            console.error("Payment save error:", err)
            setError(err instanceof Error ? err.message : "Failed to save payment")
            router.push("/payment-failed")
          }
        },
        prefill: {
          name: user?.companyName || user?.name || "",
          email: user?.email || "",
          contact: user?.mobileNo || "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setIsPaymentLoading(false)
            // Don't automatically redirect on dismiss - user might want to try again
          },
        },
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay is not available. Please refresh the page and try again.")
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on("payment.failed", (response: ResponseError) => {
        console.error("Payment failed:", response)
        setIsPaymentLoading(false)
        setError(`Payment failed: ${response.error?.description || "Unknown error"}`)
      })

      paymentObject.open()
    } catch (err) {
      console.error("Razorpay error:", err)
      setError(err instanceof Error ? err.message : "Payment initialization failed")
      setIsPaymentLoading(false)
      if (err instanceof Error && err.message.includes("not authenticated")) {
        router.push("/")
      }
    }
  }

  // Separate useEffect for user verification (runs once on mount)
  useEffect(() => {
    verifyTokenAndFetchUser()
  }, [verifyTokenAndFetchUser])

  // Separate useEffect for requirements (runs when selectedIds change)
  useEffect(() => {
    if (selectedIds.length > 0) {
      fetchRequirements(selectedIds)
    }
  }, [selectedIds, fetchRequirements])

  const handleAddressUpdate = async () => {
    if (!billingAddress.trim()) {
      setError("Billing address is required")
      return
    }
    if (!sameAddress && !shippingAddress.trim()) {
      setError("Shipping address is required")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const token = getCookie("token")
      if (!token || !user) {
        throw new Error("User not authenticated")
      }

      const payload = {
        billingAddress: billingAddress.trim(),
        shippingAddress: sameAddress ? billingAddress.trim() : shippingAddress.trim(),
      }

      const response = await fetch(`/api/v1/users/${user._id}/billing`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to update addresses" }))
        throw new Error(errorData.message || "Failed to update addresses")
      }

      await verifyTokenAndFetchUser()
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Address update error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Memoize calculations to prevent unnecessary recalculations
  const { subtotal, totalGST, total } = useMemo(() => {
    if (requirements.length === 0) {
      return { subtotal: 0, totalGST: 0, total: 0 }
    }

    const subtotal = requirements.reduce((total, req) => {
      const amount = getAmount(req)
      return total + amount
    }, 0)

    const totalGST = requirements.reduce((totalGST, req) => {
      const amount = getAmount(req)
      const gstPercentage = Number(req.gstPercentage) || 0
      const gstAmount = (amount * gstPercentage) / 100
      return totalGST + gstAmount
    }, 0)

    const total = subtotal + totalGST

    return { subtotal, totalGST, total }
  }, [requirements, getAmount])

  // Early return for no selected items
  if (selectedIds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Items Selected</h2>
            <p className="text-gray-600 mb-6">Please select items to checkout.</p>
            <Button onClick={() => router.back()} className="w-full bg-blue-600 hover:bg-blue-700">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardContent className="p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we prepare your order.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Address Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-blue-600" />
              Update Addresses
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="billing-address" className="text-sm font-semibold text-gray-700">
                Billing Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="billing-address"
                placeholder="Enter your complete billing address"
                value={billingAddress}
                onChange={(e) => {
                  setBillingAddress(e.target.value)
                  if (sameAddress) setShippingAddress(e.target.value)
                }}
                disabled={loading}
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="shipping-address" className="text-sm font-semibold text-gray-700">
                Shipping Address {!sameAddress && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="shipping-address"
                placeholder="Enter your complete shipping address"
                value={sameAddress ? billingAddress : shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                disabled={loading || sameAddress}
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required={!sameAddress}
              />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="same-address"
                checked={sameAddress}
                onCheckedChange={(checked) => {
                  setSameAddress(checked as boolean)
                  if (checked) setShippingAddress(billingAddress)
                }}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="same-address" className="text-sm font-medium text-gray-700">
                Billing and shipping addresses are the same
              </Label>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddressUpdate}
              disabled={loading || !billingAddress.trim() || (!sameAddress && !shippingAddress.trim())}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Update Addresses
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-0">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Mobile Checkout</CardTitle>
            <p className="text-blue-100">Complete your secure purchase</p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Customer Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{user?.companyName || user?.name || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{user?.mobileNo || "N/A"}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm text-gray-600">{billingAddress || "Address not set"}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Update Address
                </Button>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Order Items ({requirements.length})
              </h3>
              {requirements.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items found</p>
              ) : (
                <div className="space-y-3">
                  {requirements.map((req) => {
                    const amount = getAmount(req)
                    const gstAmount = (amount * Number(req.gstPercentage)) / 100
                    return (
                      <div key={req._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900 text-sm leading-tight">{req.productName}</h4>
                            <Badge variant="secondary" className="text-xs ml-2">
                              {req.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            Qty: {req.minQty} {req.measurement}
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Amount:</span>
                            <span className="font-semibold text-gray-900">₹{formatter.format(amount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">GST ({req.gstPercentage}%):</span>
                            <span className="text-sm text-gray-900">₹{formatter.format(gstAmount)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{formatter.format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST</span>
                  <span className="font-medium text-gray-900">₹{formatter.format(totalGST)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">₹{formatter.format(total)}</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Terms and Payment */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                  I accept the{" "}
                  <span className="text-blue-600 hover:underline cursor-pointer font-medium">terms and conditions</span>
                </label>
              </div>

              <Button
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!termsAccepted || isPaymentLoading || requirements.length === 0 || total <= 0}
                onClick={displayRazorpay}
              >
                {isPaymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Pay ₹{formatter.format(total)}
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-gray-500">
                <Shield className="h-3 w-3 inline mr-1" />
                Secure payment powered by Razorpay
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OrdersComponent
