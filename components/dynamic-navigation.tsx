"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import NavigationBar from "./navigation-bar"
import LoginButton from "./login-button"

export default function DynamicNavigation() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
    checkAuthStatus()
    setIsLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const getCookie = (name: string): string | null => {
    if (typeof window === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  const checkAuthStatus = () => {
    if (typeof window === "undefined") return
    try {
      const userTypeCookie = getCookie("userType")
      setUserType(userTypeCookie)
      setIsLoggedIn(!!userTypeCookie)
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsLoggedIn(false)
      setUserType(null)
    }
  }

  const handleDashboardRedirect = () => {
    if (userType === "admin") {
      router.push("/admin/dashboard/profile")
    } else if (userType === "buyer") {
      router.push("/dashboard/profile")
    }
    setIsMobileMenuOpen(false) // Close mobile menu after navigation
  }

  if (!isMounted || isLoading) {
    return (
      <div>
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  Sabecho
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse hidden md:inline-flex" />
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden text-gray-900">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 bg-gray-50 p-0">
                    <SheetTitle className="flex items-center justify-between p-4 border-b">
                      <span className="text-xl font-bold text-blue-600">Menu</span>
                    </SheetTitle>
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-4 mt-4" />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto">
            <div className="flex items-center h-16 relative">
              <div className="flex space-x-4 px-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="py-3 px-6 bg-white/10 rounded-md w-32 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Sabecho
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  className="hidden md:inline-flex text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white"
                  onClick={handleDashboardRedirect}
                >
                  Dashboard
                </Button>
              ) : (
                <LoginButton />
              )}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-gray-900">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-gray-50 p-0">
                  <SheetTitle className="flex items-center justify-between p-4 border-b">
                    <span className="text-xl font-bold text-blue-600">Menu</span>
                  </SheetTitle>
                  <div className="flex flex-col space-y-2 p-4">
                    <div className="border-t pt-2">
                      <NavigationBar mobileView={true} />
                    </div>
                    <div className="border-t pt-2 space-y-2">
                      {isLoggedIn ? (
                        <Button
                          variant="outline"
                          className="w-full h-12 text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white text-base"
                          onClick={handleDashboardRedirect}
                        >
                          Dashboard
                        </Button>
                      ) : (
                        <div className="w-full">
                          <LoginButton
                            className="text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white w-full h-12 text-base"
                          />
                        </div>
                      )}
                      <Link href="/products" passHref>
                        <Button
                          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
      <div className="hidden md:block">
        <NavigationBar mobileView={false} />
      </div>
    </div>
  )
}