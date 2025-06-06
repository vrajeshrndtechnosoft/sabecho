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
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Place Order ({selectedRequirements.length})
    </Button>
  )
}

// Request Negotiation Button Component
interface RequestNegotiationButtonProps {
  selectedRequirements: string[]
  requirements: Requirement[]
}

const RequestNegotiationButton: React.FC<RequestNegotiationButtonProps> = ({ selectedRequirements, requirements }) => {
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
      const firstId = selectedRequirements[0]
      router.push(`/negotiation/${firstId}`)
    }
  }

  return (
    <Button
      onClick={handleRequestNegotiation}
      disabled={!canRequestNegotiation()}
      className={`${
        canRequestNegotiation()
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'quoted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'active':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
          <div className="p-4 bg-gray-50 flex items-center space-x-4">
            <Checkbox
              id="select-all"
              checked={selectedRequirements.length === requirements.length && requirements.length > 0}
              onCheckedChange={handleSelectAll}
              className='border-slate-800'
            />
            <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
              Select All
            </label>
          </div>
        )}

        {requirements.map((requirement) => (
          <div key={requirement._id} className="p-6 hover:bg-gray-50 transition-colors duration-200 flex items-start space-x-4">
            {/* Checkbox */}
            <Checkbox
              id={`req-${requirement.reqId}`}
              checked={selectedRequirements.includes(requirement.reqId)}
              onCheckedChange={(checked) => handleSelectRequirement(requirement.reqId, checked as boolean)}
              className='border-slate-800'
            />

            <div className="flex-1 space-y-4">
              <div className="flex-1 space-y-3">
                {/* Header with ID, Status, and Negotiable Badge */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Hash size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-900">ID: {requirement.reqId}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(requirement.status)}`}>
                    {requirement.status.toUpperCase()}
                  </span>
                  {requirement.negotiation && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border-green-200">
                      Negotiable
                    </span>
                  )}
                </div>

                {/* Item Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Package size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-500">Product:</span>
                      <span className="ml-1 font-medium text-gray-900">{requirement.productName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Building size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-500">Qty:</span>
                      <span className="ml-1 font-medium text-gray-900">{requirement.minQty} {requirement.measurement}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-1 font-medium text-gray-900">₹{formatter.format(requirement.amount)}</span>
                  </div>

                  {requirement.negotiationDetails && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Negotiated Amount:</span>
                      <span className="ml-1 font-medium text-gray-900">₹{formatter.format(requirement.negotiationDetails.newAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {requirement.description && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Description</span>
                    <p className="text-sm text-gray-700 mt-1">{requirement.description}</p>
                  </div>
                )}
              </div>

              {/* Check Updates Button */}
              {requirement.negotiationDetails && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-blue-600 border-blue-500 hover:bg-blue-50">
                      <Info className="w-4 h-4 mr-2" />
                      Check Updates
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Latest Negotiation Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">New Amount:</span>
                        <span className="font-medium">₹{formatter.format(requirement.negotiationDetails.newAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Negotiation Amount:</span>
                        <span className="font-medium">₹{formatter.format(requirement.negotiationDetails.negotiationAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Negotiation Quantity:</span>
                        <span className="font-medium">{requirement.negotiationDetails.negotiationQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preview Amount:</span>
                        <span className="font-medium">₹{formatter.format(requirement.negotiationDetails.previewAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preview Quantity:</span>
                        <span className="font-medium">{requirement.negotiationDetails.previewQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Comment:</span>
                        <span className="font-medium">{requirement.negotiationDetails.comment}</span>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
          <div key={requirement._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 space-y-3">
                {/* Header with ID and Status */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Hash size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-900">ID: {requirement.reqId}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(requirement.status)}`}>
                    {requirement.status.toUpperCase()}
                  </span>
                </div>

                {/* Item Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Package size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-500">Item:</span>
                      <span className="ml-1 font-medium text-gray-900">{requirement.productName || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Building size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-500">Qty:</span>
                      <span className="ml-1 font-medium text-gray-900">{requirement.minQty} {requirement.measurement}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {requirement.description && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Description</span>
                    <p className="text-sm text-gray-700 mt-1">{requirement.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
        <p className="text-gray-600 mt-2">Monitor your order status</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium
                transition-all duration-200 ${getTabColor(tab.key)}
              `}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg border shadow-sm relative">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-lg">Loading {activeTab.toLowerCase()} orders...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
              <AlertCircle size={24} />
              <span className="text-lg">{error}</span>
            </div>
          </div>
        ) : requirements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Package size={48} className="mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No {activeTab.toLowerCase()} orders</h3>
            <p>You don&apos;t have any {activeTab.toLowerCase()} orders at the moment.</p>
          </div>
        ) : activeTab === 'Quoted' ? renderQuotedTab() : renderOtherTabs()}

        {/* Action Buttons for Quoted Tab */}
        {activeTab === 'Quoted' && selectedRequirements.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end space-x-3 shadow-md">
            <PlaceOrderButton selectedRequirements={selectedRequirements} userId={userId} />
            <RequestNegotiationButton selectedRequirements={selectedRequirements} requirements={requirements} />
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackingComponent