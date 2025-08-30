/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  FileText,
  CheckCircle,
  Activity,
  Loader2,
  AlertCircle,
  Package,
  Building,
  Hash,
  ShoppingCart,
  MessageSquare,
  Info,
  Calendar,
  Percent,
  FileBarChart,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

interface TokenResponse {
  email: string
  exp: number
  iat: number
  userId: string
  userType: string
}

interface NegotiationDetails {
  customerOfferPriceWithCommission: number
  negotiationAmount: number
  negotiationQuantity: number
  previewAmount: number
  previewQuantity: number
  comment: string
  newAmount: number
}

interface Requirement {
  _id: string
  status: string
  name: string
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
  createdAt: string
  __v: number
  negotiationDetails?: NegotiationDetails
}

interface PaymentDetail {
  _id: string
  paymentId: string
  amount: number
  status: string
  orderDetails: Requirement[]
  paymentDetails: {
    id: string
    entity: string
    amount: number
    currency: string
    status: string
    email: string
    contact: string
    created_at: number
  }
  createdAt: string
  __v: number
}

interface ErrorResponse {
  message: string
}

type StatusType = "Pending" | "Quoted" | "Completed" | "Active"

interface FilterState {
  negotiable: boolean | null
  amountRangeIndex: number | null
  quantityRangeIndex: number | null
}

const amountRanges: [number, number][] = [
  [0, 10000],
  [10000, 50000],
  [50000, 100000],
  [100000, 500000],
  [500000, Number.POSITIVE_INFINITY],
]

const quantityRanges: [number, number][] = [
  [0, 10],
  [10, 50],
  [50, 100],
  [100, 500],
  [500, Number.POSITIVE_INFINITY],
]

const PlaceOrderButton: React.FC<{ selectedRequirements: string[]; userId: string }> = ({
  selectedRequirements,
  userId,
}) => {
  const router = useRouter()

  const handlePlaceOrder = () => {
    if (selectedRequirements.length > 0) {
      const ids = selectedRequirements.join(",")
      router.push(`/checkout/${userId}?ids=${ids}`)
    }
  }

  return (
    <Button
      onClick={handlePlaceOrder}
      className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 shadow-lg"
      size="lg"
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      Place Order ({selectedRequirements.length})
    </Button>
  )
}

const RequestNegotiationButton: React.FC<{
  selectedRequirements: string[]
  requirements: Requirement[]
  userId: string
}> = ({ selectedRequirements, requirements, userId }) => {
  const router = useRouter()

  const canRequestNegotiation = () => {
    if (selectedRequirements.length === 0) return false
    return selectedRequirements.every((id) => requirements.find((r) => r.reqId === id)?.negotiation === true)
  }

  const handleRequestNegotiation = () => {
    if (selectedRequirements.length > 0 && canRequestNegotiation()) {
      router.push(`/negotiation/${userId}?id=${selectedRequirements[0]}`)
    }
  }

  return (
    <Button
      onClick={handleRequestNegotiation}
      disabled={!canRequestNegotiation()}
      className={`font-medium px-6 py-3 shadow-lg ${
        canRequestNegotiation()
          ? "bg-green-500 hover:bg-green-600 text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
      size="lg"
    >
      <MessageSquare className="w-5 h-5 mr-2" />
      Request Negotiation
    </Button>
  )
}

const TrackingComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatusType>("Pending")
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([])
  const [filterState, setFilterState] = useState<FilterState>({
    negotiable: null,
    amountRangeIndex: null,
    quantityRangeIndex: null,
  })
  const [tempFilterState, setTempFilterState] = useState<FilterState>({
    negotiable: null,
    amountRangeIndex: null,
    quantityRangeIndex: null,
  })
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  const formatter = new Intl.NumberFormat("en-IN")

  const tabs = [
    { key: "Pending" as StatusType, label: "Pending", icon: Clock, color: "yellow" },
    { key: "Quoted" as StatusType, label: "Quoted", icon: FileText, color: "blue" },
    { key: "Completed" as StatusType, label: "Completed", icon: CheckCircle, color: "green" },
    { key: "Active" as StatusType, label: "Active", icon: Activity, color: "orange" },
  ]

  useEffect(() => {
    verifyTokenAndFetchRequirements()
    setSelectedRequirements([])
  }, [activeTab])

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const verifyTokenAndFetchRequirements = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getCookie("token")
      if (!token) throw new Error("No authentication token found")

      const tokenResponse = await fetch(`/api/v1/auth/verifyToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (!tokenResponse.ok) throw new Error("Token verification failed")

      const tokenData: TokenResponse = await tokenResponse.json()
      setUserEmail(tokenData.email)
      setUserId(tokenData.userId)

      let endpoint = `/api/v1/requirements/ByEmail`
      let payload = { email: tokenData.email, status: activeTab }

      if (activeTab === "Quoted") {
        endpoint = `/api/v1/quoted-requirements/get`
      } else if (activeTab === "Completed") {
        endpoint = `/api/v1/payment/payment-details`
        payload = payload
      }

      const requirementsResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!requirementsResponse.ok) {
        const errorData: ErrorResponse = await requirementsResponse.json()
        if (
          requirementsResponse.status === 404 &&
          errorData.message === "No requirements found for the provided email and status"
        ) {
          setRequirements([])
          setPaymentDetails([])
          return
        }
        throw new Error(errorData.message || "Failed to fetch requirements")
      }

      const data = await requirementsResponse.json()
      if (activeTab === "Completed") {
        setPaymentDetails(data)
      } else {
        setRequirements(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "quoted":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "active":
        return "bg-orange-100 text-orange-800 border-orange-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getTabColor = (tabKey: StatusType) => {
    const tab = tabs.find((t) => t.key === tabKey)
    switch (tab?.color) {
      case "yellow":
        return activeTab === tabKey
          ? "bg-yellow-500 text-white border-yellow-500"
          : "bg-white text-yellow-600 border-gray-200 hover:bg-yellow-50"
      case "blue":
        return activeTab === tabKey
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-blue-600 border-gray-200 hover:bg-blue-50"
      case "green":
        return activeTab === tabKey
          ? "bg-green-500 text-white border-green-500"
          : "bg-white text-green-600 border-gray-200 hover:bg-green-50"
      case "orange":
        return activeTab === tabKey
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white text-orange-600 border-gray-200 hover:bg-orange-50"
      default:
        return "bg-white text-gray-600 border-gray-200"
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequirements((activeTab === "Quoted" ? filteredRequirements : requirements).map((req) => req.reqId))
    } else {
      setSelectedRequirements([])
    }
  }

  const handleSelectRequirement = (reqId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequirements([...selectedRequirements, reqId])
    } else {
      setSelectedRequirements(selectedRequirements.filter((id) => id !== reqId))
    }
  }

  const filteredRequirements = useMemo(() => {
    if (activeTab !== "Quoted") return requirements

    return requirements.filter((req) => {
      const negotiableMatch = filterState.negotiable === null || req.negotiation === filterState.negotiable

      const amountMatch =
        filterState.amountRangeIndex === null ||
        (req.amount >= amountRanges[filterState.amountRangeIndex][0] &&
          (amountRanges[filterState.amountRangeIndex][1] === Number.POSITIVE_INFINITY ||
            req.amount <= amountRanges[filterState.amountRangeIndex][1]))

      const quantityMatch =
        filterState.quantityRangeIndex === null ||
        (req.minQty >= quantityRanges[filterState.quantityRangeIndex][0] &&
          (quantityRanges[filterState.quantityRangeIndex][1] === Number.POSITIVE_INFINITY ||
            req.minQty <= quantityRanges[filterState.quantityRangeIndex][1]))

      return negotiableMatch && amountMatch && quantityMatch
    })
  }, [requirements, filterState, activeTab])

  const handleApplyFilters = () => {
    setFilterState(tempFilterState)
    setIsFilterDialogOpen(false)
  }

  const handleResetFilters = () => {
    const resetState: FilterState = {
      negotiable: null,
      amountRangeIndex: null,
      quantityRangeIndex: null,
    }
    setTempFilterState(resetState)
    setFilterState(resetState)
    setIsFilterDialogOpen(false)
  }

  const formatRangeLabel = (range: [number, number], isAmount: boolean) => {
    const formatter = isAmount
      ? (val: number) => `₹${new Intl.NumberFormat("en-IN").format(val)}`
      : (val: number) => val.toString()
    if (range[1] === Number.POSITIVE_INFINITY) {
      return `${formatter(range[0])}+`
    }
    return `${formatter(range[0])} - ${formatter(range[1])}`
  }

  const renderQuotedTab = () => (
    <div className="space-y-4">
      {filteredRequirements.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                id="select-all"
                checked={selectedRequirements.length === filteredRequirements.length && filteredRequirements.length > 0}
                onCheckedChange={handleSelectAll}
                className="border-slate-800 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label htmlFor="select-all" className="text-sm font-semibold text-gray-800 cursor-pointer">
                Select All ({filteredRequirements.length} items)
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredRequirements.map((requirement) => (
          <Card
            key={requirement._id}
            className="hover:shadow-md transition-shadow duration-200 border-l-4 border-orange-200 hover:border-orange-400"
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Checkbox
                  id={`req-${requirement.reqId}`}
                  checked={selectedRequirements.includes(requirement.reqId)}
                  onCheckedChange={(checked) => handleSelectRequirement(requirement.reqId, checked as boolean)}
                  className="border-slate-800 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 mt-1"
                />

                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Hash size={18} className="text-orange-500" />
                      <span className="font-bold text-gray-900 text-lg">ID: {requirement.reqId}</span>
                    </div>

                    <Badge className={getStatusColor(requirement.status)}>{requirement.status.toUpperCase()}</Badge>

                    {requirement.negotiation && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">✓ Negotiable</Badge>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{formatDate(requirement.created_at)}</span>
                    </div>
                  </div>

                  <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Package size={18} className="text-orange-600" />
                          <div>
                            <span className="text-gray-600 font-medium">Product:</span>
                            <div className="font-bold text-gray-900">{requirement.productName}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Building size={18} className="text-orange-600" />
                          <div>
                            <span className="text-gray-600 font-medium">Quantity:</span>
                            <div className="font-bold text-gray-900">
                              {requirement.minQty} {requirement.measurement}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600 font-medium">Base Amount:</span>
                          <div className="font-bold text-green-700 text-lg">
                            ₹{formatter.format(requirement.amount)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <FileBarChart size={18} className="text-orange-600" />
                          <div>
                            <span className="text-gray-600 font-medium">HSN Code:</span>
                            <div className="font-bold text-gray-900">{requirement.hsnCode || "N/A"}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Percent size={18} className="text-orange-600" />
                          <div>
                            <span className="text-gray-600 font-medium">GST:</span>
                            <div className="font-bold text-gray-900">{requirement.gstPercentage}%</div>
                          </div>
                        </div>

                        {requirement.negotiationDetails && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600 font-medium">Negotiated Amount:</span>
                            <div className="font-bold text-orange-700 text-lg">
                              ₹{formatter.format(requirement.negotiationDetails.newAmount)}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={16} className="text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        All transporting and GST charges are additional to the basic amount.
                      </span>
                    </div>
                  </div>

                  {requirement.description && (
                    <Card className="bg-gray-50 border-gray-200">
                      <CardContent className="p-4">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                          Product Description
                        </span>
                        <p className="text-sm text-gray-700 mt-2 leading-relaxed">{requirement.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {requirement.negotiationDetails && (
                    <div className="pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50 font-medium bg-transparent"
                          >
                            <Info className="w-4 h-4 mr-2" /> View Negotiation Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-bold">Latest Negotiation Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-3">
                                  <span className="text-green-600 font-medium">New Amount:</span>
                                  <div className="font-bold text-green-800 text-lg">
                                    ₹{formatter.format(requirement.negotiationDetails.newAmount)}
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-3">
                                  <span className="text-blue-600 font-medium">Negotiation Amount:</span>
                                  <div className="font-bold text-blue-800 text-lg">
                                    ₹{formatter.format(requirement.negotiationDetails.negotiationAmount)}
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-purple-50 border-purple-200">
                                <CardContent className="p-3">
                                  <span className="text-purple-600 font-medium">Negotiation Quantity:</span>
                                  <div className="font-bold text-purple-800">
                                    {requirement.negotiationDetails.negotiationQuantity}
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-orange-50 border-orange-200">
                                <CardContent className="p-3">
                                  <span className="text-orange-600 font-medium">Preview Amount:</span>
                                  <div className="font-bold text-orange-800 text-lg">
                                    ₹{formatter.format(requirement.negotiationDetails.previewAmount)}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {requirement.negotiationDetails.comment && (
                              <Card className="bg-gray-50 border-gray-200">
                                <CardContent className="p-3">
                                  <span className="text-gray-600 font-medium">Comment:</span>
                                  <p className="text-gray-800 mt-1">{requirement.negotiationDetails.comment}</p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderOtherTabs = () => (
    <div className="space-y-4">
      {requirements.map((requirement) => (
        <Card
          key={requirement._id}
          className="hover:shadow-md transition-shadow duration-200 border-l-4 border-gray-200 hover:border-gray-300"
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Hash size={18} className="text-gray-500" />
                  <span className="font-bold text-gray-900 text-lg">ID: {requirement.reqId}</span>
                </div>

                <Badge className={getStatusColor(requirement.status)}>{requirement.status.toUpperCase()}</Badge>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{formatDate(requirement.createdAt)}</span>
                </div>
              </div>

              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Package size={18} className="text-gray-600" />
                      <div>
                        <span className="text-gray-600 font-medium">Product:</span>
                        <div className="font-bold text-gray-900">{requirement.name || "N/A"}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Building size={18} className="text-gray-600" />
                      <div>
                        <span className="text-gray-600 font-medium">Quantity:</span>
                        <div className="font-bold text-gray-900">
                          {requirement.minQty} {requirement.measurement}
                        </div>
                      </div>
                    </div>

                    {activeTab === "Quoted" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <FileBarChart size={18} className="text-gray-600" />
                          <div>
                            <span className="text-gray-600 font-medium">HSN Code:</span>
                            <div className="font-bold text-gray-900">{requirement.hsnCode || "N/A"}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Percent size={18} className="text-gray-600" />
                          <div>
                            <span className="text-gray-600 font-medium">GST:</span>
                            <div className="font-bold text-gray-900">{requirement.gstPercentage}%</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {requirement.description && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Description</span>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{requirement.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderCompletedTab = () => (
    <div className="space-y-4">
      {paymentDetails.map((payment) => (
        <Card
          key={payment._id}
          className="hover:shadow-md transition-shadow duration-200 border-l-4 border-green-200 hover:border-green-300"
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-bold text-gray-900">Payment ID: {payment.paymentId}</div>
                <Badge className="bg-green-100 text-green-800 border-green-300 mt-2">{payment.status}</Badge>
              </div>
              <div className="text-xl font-semibold text-green-700">₹{formatter.format(payment.amount)}</div>
            </div>

            <div className="mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-orange-600 border-orange-300 hover:bg-orange-50 bg-transparent"
                  >
                    View Order Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Order Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {payment.orderDetails.map((order) => (
                      <Card key={order._id} className="bg-gray-50">
                        <CardContent className="p-4 space-y-2">
                          <div>
                            <span className="font-medium">Product Name:</span> {order.productName}
                          </div>
                          <div>
                            <span className="font-medium">ReqId:</span> {order.reqId}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {order.minQty}
                          </div>
                          <div>
                            <span className="font-medium">Measurement:</span> {order.measurement}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {order.status}
                          </div>
                          <div>
                            <span className="font-medium">Description:</span> {order.description}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Tracking</h1>
        <p className="text-gray-600 text-xl">Monitor your order status and manage your requirements</p>
      </div>

      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ? "default" : "outline"}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all duration-200 ${getTabColor(tab.key)}`}
                size="lg"
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </Button>
            )
          })}
        </div>

        {activeTab === "Quoted" && (
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter size={20} /> Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Requirements</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Only Negotiable</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={tempFilterState.negotiable === true}
                      onCheckedChange={(checked) =>
                        setTempFilterState((prev) => ({ ...prev, negotiable: checked ? true : null }))
                      }
                    />
                    <span>Only Negotiable</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Base Amount Range</Label>
                  <div className="text-sm text-gray-600">
                    {tempFilterState.amountRangeIndex !== null
                      ? formatRangeLabel(amountRanges[tempFilterState.amountRangeIndex], true)
                      : "All Amounts"}
                  </div>
                  <Slider
                    min={0}
                    max={amountRanges.length - 1}
                    step={1}
                    value={[tempFilterState.amountRangeIndex ?? 0]}
                    onValueChange={(value) =>
                      setTempFilterState((prev) => ({
                        ...prev,
                        amountRangeIndex: value[0] === 0 ? null : value[0],
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantity Range</Label>
                  <div className="text-sm text-gray-600">
                    {tempFilterState.quantityRangeIndex !== null
                      ? formatRangeLabel(quantityRanges[tempFilterState.quantityRangeIndex], false)
                      : "All Quantities"}
                  </div>
                  <Slider
                    min={0}
                    max={quantityRanges.length - 1}
                    step={1}
                    value={[tempFilterState.quantityRangeIndex ?? 0]}
                    onValueChange={(value) =>
                      setTempFilterState((prev) => ({
                        ...prev,
                        quantityRangeIndex: value[0] === 0 ? null : value[0],
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
                <Button onClick={handleApplyFilters} className="bg-orange-500 hover:bg-orange-600">
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="shadow-lg">
        {loading ? (
          <CardContent className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3 text-orange-500">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-xl font-medium">Loading {activeTab.toLowerCase()} orders...</span>
            </div>
          </CardContent>
        ) : error ? (
          <CardContent className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-6 rounded-lg border border-red-200">
              <AlertCircle size={32} />
              <span className="text-xl font-medium">{error}</span>
            </div>
          </CardContent>
        ) : (activeTab === "Quoted" ? filteredRequirements : activeTab === "Completed" ? paymentDetails : requirements)
            .length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto text-center">
              <Package size={80} className="mb-6 text-gray-300 mx-auto" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-700">No {activeTab.toLowerCase()} orders</h3>
              <p className="text-lg text-gray-500 mb-6">
                You don&apos;t have any {activeTab.toLowerCase()} orders
                {activeTab === "Quoted" ? " matching the current filters" : ""}.
              </p>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3"
                onClick={() => (window.location.href = "/products")}
              >
                Browse Products
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-6">
            {activeTab === "Quoted"
              ? renderQuotedTab()
              : activeTab === "Completed"
                ? renderCompletedTab()
                : renderOtherTabs()}
          </CardContent>
        )}

        {activeTab === "Quoted" && selectedRequirements.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 flex flex-col sm:flex-row gap-3 z-50">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0 sm:mr-4 flex items-center">
              <span className="font-medium">{selectedRequirements.length} item(s) selected</span>
            </div>
            <div className="flex gap-3">
              <PlaceOrderButton selectedRequirements={selectedRequirements} userId={userId} />
              <RequestNegotiationButton
                selectedRequirements={selectedRequirements}
                requirements={filteredRequirements}
                userId={userId}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default TrackingComponent
