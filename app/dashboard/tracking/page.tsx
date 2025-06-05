"use client"

import { useState, useEffect } from 'react'
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  Activity,
  Loader2,
  AlertCircle,
  Calendar,
  Package,
  Building,
  Hash
} from 'lucide-react'

interface TokenResponse {
  email: string
  exp: number
  iat: number
  userId: string
  userType: string
}

interface Requirement {
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

interface ErrorResponse {
  message: string
}

type StatusType = 'Pending' | 'Quoted' | 'Completed' | 'Active'

const TrackingComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatusType>('Pending')
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')

  const tabs = [
    { key: 'Pending' as StatusType, label: 'Pending', icon: Clock, color: 'yellow' },
    { key: 'Quoted' as StatusType, label: 'Quoted', icon: FileText, color: 'blue' },
    { key: 'Completed' as StatusType, label: 'Completed', icon: CheckCircle, color: 'green' },
    { key: 'Active' as StatusType, label: 'Active', icon: Activity, color: 'orange' },
  ]

  useEffect(() => {
    verifyTokenAndFetchRequirements()
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

      // First, verify the token
      const tokenResponse = await fetch('https://sabecho.com/api/v1/verifyToken', {
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

      // Then fetch requirements by email and status
      const requirementsResponse = await fetch('https://sabecho.com/api/v1/requirementsByEmail', {
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
        // Parse the error response
        const errorData: ErrorResponse = await requirementsResponse.json()
        if (requirementsResponse.status === 404 && errorData.message === "No requirements found for the provided email and status") {
          setRequirements([]) // Show "No [status] orders" UI
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
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
      <div className="bg-white rounded-lg border shadow-sm">
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
        ) : (
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
                          <span className="ml-1 font-medium text-gray-900">{requirement.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <div>
                          <span className="text-gray-500">Created At:</span>
                          <span className="ml-1 font-medium text-gray-900">{formatDate(requirement.createdAt)}</span>
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

                    {/* Specification */}
                    {requirement.specification && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Specification</span>
                        <p className="text-sm text-gray-700 mt-1">{requirement.specification}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackingComponent