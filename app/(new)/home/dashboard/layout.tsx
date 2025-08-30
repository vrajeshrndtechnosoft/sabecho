"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { User, BarChart3, Heart, LogOut, Loader2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

interface SidebarLayoutProps {
  children: React.ReactNode
}

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

// Helper function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const expiry = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expiry
  } catch (error) {
    console.error("Error decoding token:", error)
    return true // Assume expired if token is invalid
  }
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      label: "Profile",
      href: "/home/dashboard/profile",
      icon: User,
      description: "Manage your account",
    },
    {
      label: "Tracking",
      href: "/home/dashboard/tracking",
      icon: BarChart3,
      description: "Track your orders",
      badge: "3",
    },
    {
      label: "My Favorites",
      href: "/home/dashboard/favourites",
      icon: Heart,
      description: "Saved products",
    },
  ]

  // Check for token on mount and redirect if not present or expired
  useEffect(() => {
    const token = getCookie("token")
    if (!token || isTokenExpired(token)) {
      // Trigger logout if token is missing or expired
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax"
      document.cookie = "userType=; path=/; max-age=0; SameSite=Lax"
      window.location.href = "/"
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogout = () => {
    // Remove cookies
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax"
    document.cookie = "userType=; path=/; max-age=0; SameSite=Lax"

    // Redirect to login or home page
    window.location.href = "/"
  }

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  // Show loading state while checking token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-gray-100">
        <div className="flex items-center space-x-3 bg-white p-8 rounded-2xl shadow-xl">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="text-lg font-medium text-gray-700">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent"
            >
              Sabecho
            </Link>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Dashboard
            </Badge>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 bg-gradient-to-br from-orange-50 to-gray-50">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">Welcome back!</h2>
                      <p className="text-sm text-gray-500">Manage your account</p>
                    </div>
                  </div>
                </div>
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = isActiveRoute(item.href)

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                              isActive
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                                : "text-gray-700 hover:bg-white hover:shadow-md"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Icon size={20} className="flex-shrink-0" />
                            <div className="flex-1">
                              <span className="font-medium">{item.label}</span>
                              <p className={`text-xs ${isActive ? "text-orange-100" : "text-gray-500"}`}>
                                {item.description}
                              </p>
                            </div>
                            {item.badge && (
                              <Badge
                                className={`${isActive ? "bg-white text-orange-600" : "bg-orange-100 text-orange-600"}`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
                <div className="p-4 border-t bg-white">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut size={20} className="mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:top-0">
          <div className="flex flex-col flex-1 bg-white shadow-xl border-r">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3 mb-4">
                <Link
                  href="/"
                  className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent"
                >
                  Sabecho
                </Link>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Dashboard
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Welcome back!</p>
                  <p className="text-sm text-gray-500">Manage your account</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(item.href)

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-50 hover:shadow-md"
                        }`}
                      >
                        <Icon size={20} className="flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-medium">{item.label}</span>
                          <p className={`text-xs ${isActive ? "text-orange-100" : "text-gray-500"}`}>
                            {item.description}
                          </p>
                        </div>
                        {item.badge && (
                          <Badge
                            className={`${isActive ? "bg-white text-orange-600" : "bg-orange-100 text-orange-600"}`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="p-4 border-t">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut size={20} className="mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default SidebarLayout
