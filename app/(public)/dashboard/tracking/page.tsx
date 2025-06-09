"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  negotiationDetails?: NegotiationDetails
}

interface ErrorResponse {
  message: string
}

type StatusType = 'Pending' | 'Quoted' | 'Completed' | 'Active'

// Place Order Button Component
interface PlaceOrderButtonProps {
  selectedRequirements: string[]
  userId: string
}

const PlaceOrderButton: React.FC<PlaceOrderButtonProps> = ({ selectedRequirements, userId }) => {
  const router = useRouter()

  const handlePlaceOrder = () => {
    if (selectedRequirements.length > 0) {
      const ids = selectedRequirements.join(',')
      router.push(`/checkout/${userId}?ids=${ids}`)
    }
  }

  return (
    <Button
      onClick={handlePlaceOrder}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 shadow-lg"
      size="lg"
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      Place Order ({selectedRequirements.length})
    </Button>
  )
}

// Request Negotiation Button Component
interface RequestNegotiationButtonProps {
  selectedRequirements: string[]
  requirements: Requirement[]
  userId: string
}

const RequestNegotiationButton: React.FC<RequestNegotiationButtonProps> = ({ selectedRequirements, requirements, userId }) => {
  const router = useRouter()

  const canRequestNegotiation = () => {
    if (selectedRequirements.length === 0) return false
    return selectedRequirements.every(id => {
      const req = requirements.find(r => r.reqId === id)
      return req?.negotiation === true
    })
  }

  const handleRequestNegotiation = () => {
    if (selectedRequirements.length > 0 && canRequestNegotiation()) {
      const ids = selectedRequirements.join(',')
      router.push(`/negotiation/${userId}?ids=${ids}`)
    }
  }

  return (
    <Button
      onClick={handleRequestNegotiation}
      disabled={!canRequestNegotiation()}
      className={`font-medium px-6 py-3 shadow-lg ${
        canRequestNegotiation()
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      size="lg"
    >
      <MessageSquare className="w-5 h-5 mr-2" />
      Request Negotiation
    </Button>
  )
}

const TrackingComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatusType>('Pending')
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([])
  const API_URL = process.env.API_URL || "https://sabecho.com"

  // Define the number formatter for Indian locale
  const formatter = new Intl.NumberFormat('en-IN')

  const tabs = [
    { key: 'Pending' as StatusType, label: 'Pending', icon: Clock, color: 'yellow' },
    { key: 'Quoted' as StatusType, label: 'Quoted', icon: FileText, color: 'blue' },
    { key: 'Completed' as StatusType, label: 'Completed', icon: CheckCircle, color: 'green' },
    { key: 'Active' as StatusType, label: 'Active', icon: Activity, color: 'orange' },
  ]

  useEffect(() => {
    verifyTokenAndFetchRequirements()
    setSelectedRequirements([]) // Reset selection when tab changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const verifyTokenAndFetchRequirements = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getCookie('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Verify the token
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
      setUserEmail(tokenData.email)
      setUserId(tokenData.userId)

      // Fetch requirements based on the tab
      let endpoint = `${API_URL}/api/v1/requirementsByEmail`
      if (activeTab === 'Quoted') {
        endpoint = `${API_URL}/api/v1/quotaRequirement/get`
      }

      const requirementsResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tokenData.email,
          status: activeTab
        }),
      })

      if (!requirementsResponse.ok) {
        const errorData: ErrorResponse = await requirementsResponse.json()
        if (requirementsResponse.status === 404 && errorData.message === "No requirements found for the provided email and status") {
          setRequirements([])
          return
        }
        throw new Error(errorData.message || 'Failed to fetch requirements')
      }

      const requirementsData: Requirement[] = await requirementsResponse.json()
      setRequirements(requirementsData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'quoted':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'active':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTabColor = (tabKey: StatusType) => {
    const tab = tabs.find(t => t.key === tabKey)
    switch (tab?.color) {
      case 'yellow':
        return activeTab === tabKey 
          ? 'bg-yellow-500 text-white border-yellow-500' 
          : 'bg-white text-yellow-600 border-gray-200 hover:bg-yellow-50'
      case 'blue':
        return activeTab === tabKey 
          ? 'bg-blue-500 text-white border-blue-500' 
          : 'bg-white text-blue-600 border-gray-200 hover:bg-blue-50'
      case 'green':
        return activeTab === tabKey 
          ? 'bg-green-500 text-white border-green-500' 
          : 'bg-white text-green-600 border-gray-200 hover:bg-green-50'
      case 'orange':
        return activeTab === tabKey 
          ? 'bg-orange-500 text-white border-orange-500' 
          : 'bg-white text-orange-600 border-gray-200 hover:bg-orange-50'
      default:
        return 'bg-white text-gray-600 border-gray-200'
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequirements(requirements.map(req => req.reqId))
    } else {
      setSelectedRequirements([])
    }
  }

  const handleSelectRequirement = (reqId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequirements([...selectedRequirements, reqId])
    } else {
      setSelectedRequirements(selectedRequirements.filter(id => id !== reqId))
    }
  }

  const renderQuotedTab = () => {
    return (
      <div className="divide-y divide-gray-200">
        {/* Header Row for Quoted Tab */}
        {requirements.length > 0 && (
          <div className="p-4 bg-gray-50 border-b-2 border-gray-200 flex items-center space-x-4">
            <Checkbox
              id="select-all"
              checked={selectedRequirements.length === requirements.length && requirements.length > 0}
              onCheckedChange={handleSelectAll}
              className='border-slate-800 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
            />
            <label htmlFor="select-all" className="text-sm font-semibold text-gray-800 cursor-pointer">
              Select All ({requirements.length} items)
            </label>
          </div>
        )}

        {requirements.map((requirement) => (
          <div key={requirement._id} className="p-6 hover:bg-blue-50 transition-colors duration-200 border-l-4 border-transparent hover:border-blue-400">
            <div className="flex items-start space-x-4">
              {/* Checkbox */}
              <Checkbox
                id={`req-${requirement.reqId}`}
                checked={selectedRequirements.includes(requirement.reqId)}
                onCheckedChange={(checked) => handleSelectRequirement(requirement.reqId, checked as boolean)}
                className='border-slate-800 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1'
              />

              <div className="flex-1 space-y-4">
                {/* Header with ID, Status, and Negotiable Badge */}
                <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Hash size={18} className="text-blue-500" />
                    <span className="font-bold text-gray-900 text-lg">ID: {requirement.reqId}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(requirement.status)}`}>
                    {requirement.status.toUpperCase()}
                  </span>
                  {requirement.negotiation && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border-2 border-green-300">
                      ✓ Negotiable
                    </span>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{formatDate(requirement.created_at)}</span>
                  </div>
                </div>

                {/* Product Details Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Package size={18} className="text-blue-600" />
                      <div>
                        <span className="text-gray-600 font-medium">Product:</span>
                        <div className="font-bold text-gray-900">{requirement.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Building size={18} className="text-blue-600" />
                      <div>
                        <span className="text-gray-600 font-medium">Quantity:</span>
                        <div className="font-bold text-gray-900">{requirement.minQty} {requirement.measurement}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 font-medium">Base Amount:</span>
                      <div className="font-bold text-green-700 text-lg">₹{formatter.format(requirement.amount)}</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FileBarChart size={18} className="text-blue-600" />
                      <div>
                        <span className="text-gray-600 font-medium">HSN Code:</span>
                        <div className="font-bold text-gray-900">{requirement.hsnCode || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Percent size={18} className="text-blue-600" />
                      <div>
                        <span className="text-gray-600 font-medium">GST:</span>
                        <div className="font-bold text-gray-900">{requirement.gstPercentage}%</div>
                      </div>
                    </div>

                    {requirement.negotiationDetails && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">Negotiated Amount:</span>
                        <div className="font-bold text-orange-700 text-lg">₹{formatter.format(requirement.negotiationDetails.newAmount)}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Charges Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      All transporting and GST charges are additional to the basic amount.
                    </span>
                  </div>
                </div>

                {/* Description */}
                {requirement.description && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Product Description</span>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{requirement.description}</p>
                  </div>
                )}

                {/* Check Updates Button */}
                {requirement.negotiationDetails && (
                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50 font-medium">
                          <Info className="w-4 h-4 mr-2" />
                          View Negotiation Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold">Latest Negotiation Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <span className="text-green-600 font-medium">New Amount:</span>
                              <div className="font-bold text-green-800 text-lg">₹{formatter.format(requirement.negotiationDetails.newAmount)}</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <span className="text-blue-600 font-medium">Negotiation Amount:</span>
                              <div className="font-bold text-blue-800 text-lg">₹{formatter.format(requirement.negotiationDetails.negotiationAmount)}</div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                              <span className="text-purple-600 font-medium">Negotiation Quantity:</span>
                              <div className="font-bold text-purple-800">{requirement.negotiationDetails.negotiationQuantity}</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                              <span className="text-orange-600 font-medium">Preview Amount:</span>
                              <div className="font-bold text-orange-800 text-lg">₹{formatter.format(requirement.negotiationDetails.previewAmount)}</div>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                              <span className="text-indigo-600 font-medium">Preview Quantity:</span>
                              <div className="font-bold text-indigo-800">{requirement.negotiationDetails.previewQuantity}</div>
                            </div>
                          </div>
                          {requirement.negotiationDetails.comment && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <span className="text-gray-600 font-medium">Comment:</span>
                              <p className="text-gray-800 mt-1">{requirement.negotiationDetails.comment}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderOtherTabs = () => {
    return (
      <div className="divide-y divide-gray-200">
        {requirements.map((requirement) => (
          <div key={requirement._id} className="p-6 hover:bg-gray-50 transition-colors duration-200 border-l-4 border-transparent hover:border-gray-300">
            <div className="space-y-4">
              {/* Header with ID, Status, and Date */}
              <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Hash size={18} className="text-gray-500" />
                  <span className="font-bold text-gray-900 text-lg">ID: {requirement.reqId}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(requirement.status)}`}>
                  {requirement.status.toUpperCase()}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{formatDate(requirement.created_at)}</span>
                </div>
              </div>

              {/* Item Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Package size={18} className="text-gray-600" />
                    <div>
                      <span className="text-gray-600 font-medium">Product:</span>
                      <div className="font-bold text-gray-900">{requirement.name || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Building size={18} className="text-gray-600" />
                    <div>
                      <span className="text-gray-600 font-medium">Quantity:</span>
                      <div className="font-bold text-gray-900">{requirement.minQty} {requirement.measurement}</div>
                    </div>
                  </div>

                  {activeTab === 'Quoted' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <FileBarChart size={18} className="text-gray-600" />
                        <div>
                          <span className="text-gray-600 font-medium">HSN Code:</span>
                          <div className="font-bold text-gray-900">{requirement.hsnCode || 'N/A'}</div>
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
              </div>

              {/* Description */}
              {requirement.description && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Description</span>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{requirement.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto min-w-sm p-6 space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Tracking</h1>
        <p className="text-gray-600 text-lg">Monitor your order status and manage your requirements</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center space-x-3 px-6 py-3 rounded-lg border-2 font-semibold
                transition-all duration-200 ${getTabColor(tab.key)}
              `}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3 text-blue-600">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-xl font-medium">Loading {activeTab.toLowerCase()} orders...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-6 rounded-lg border border-red-200">
              <AlertCircle size={32} />
              <span className="text-xl font-medium">{error}</span>
            </div>
          </div>
        ) : requirements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Package size={64} className="mb-4 text-gray-300" />
            <h3 className="text-2xl font-semibold mb-2">No {activeTab.toLowerCase()} orders</h3>
            <p className="text-lg">You don&apos;t have any {activeTab.toLowerCase()} orders at the moment.</p>
          </div>
        ) : activeTab === 'Quoted' ? renderQuotedTab() : renderOtherTabs()}

        {/* Action Buttons for Quoted Tab - Fixed Position */}
        {activeTab === 'Quoted' && selectedRequirements.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 flex flex-col sm:flex-row gap-3 z-50">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0 sm:mr-4 flex items-center">
              <span className="font-medium">{selectedRequirements.length} item(s) selected</span>
            </div>
            <div className="flex gap-3">
              <PlaceOrderButton selectedRequirements={selectedRequirements} userId={userId} />
              <RequestNegotiationButton selectedRequirements={selectedRequirements} requirements={requirements} userId={userId} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackingComponent