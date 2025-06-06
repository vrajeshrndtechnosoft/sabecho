"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  User, 
  BarChart3, 
  Heart, 
  LogOut,
  Loader2,
} from 'lucide-react' 

interface SidebarLayoutProps {
  children: React.ReactNode
}

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  const navigationItems = [
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      label: 'Tracking',
      href: '/dashboard/tracking',
      icon: BarChart3,
    },
    {
      label: 'My Favorite',
      href: '/dashboard/favourites',
      icon: Heart,
    },
  ]

  // Check for token on mount and redirect if not present
  useEffect(() => {
    const token = getCookie('token')
    if (!token) {
      window.location.href = '/'
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogout = () => {
    // Remove cookies
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax"
    document.cookie = "userType=; path=/; max-age=0; SameSite=Lax"
    
    // Redirect to login or home page
    window.location.href = '/'
  }

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  // Show loading state while checking token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {/* Mobile Top Navigation */}
      <div className="lg:hidden bg-white border-b shadow-sm">
        <div className="flex justify-center items-center overflow-x-auto px-4 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveRoute(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center space-y-1 px-6 py-3 min-w-0 whitespace-nowrap
                  transition-all duration-200
                  ${isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
          
          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center space-y-1 px-6 py-3 min-w-0 whitespace-nowrap
                       text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Layout with proper spacing */}
      <div className="hidden lg:flex lg:flex-1 p-4">
        {/* Desktop Sidebar */}
        <div className="w-64 bg-blue-700 rounded-lg shadow-lg">
          <div className="flex flex-col h-full">
            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(item.href)
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center space-x-3 px-4 py-3 rounded-lg 
                          transition-all duration-200 group
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                          }
                        `}
                      >
                        <Icon 
                          size={20} 
                          className="flex-shrink-0"
                        />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
                
                {/* Desktop Logout Button */}
                <li className="pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg 
                               text-blue-100 hover:bg-red-600 hover:text-white 
                               transition-all duration-200 group"
                  >
                    <LogOut size={20} className="flex-shrink-0" />
                    <span className="font-medium">Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content with proper spacing */}
        <div className="flex-1 ml-4">
          <main className="h-full bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-4">
            {children}
          </div>
        </main> 
      </div>
    </div>
  )
}

export default SidebarLayout