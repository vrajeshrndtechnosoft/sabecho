"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, Search, User, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
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
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
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
      router.push("/home/dashboard/profile")
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax"
    document.cookie = "userType=; path=/; max-age=0; SameSite=Lax"
    setIsLoggedIn(false)
    setUserType(null)
    router.push("/")
    setIsMobileMenuOpen(false)
  }

  if (!isMounted || isLoading) {
    return (
      <div>
        <nav className="bg-white shadow-sm border-b">
          <div className="mx-auto px-4 w-full">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent"
                >
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
                      <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                        Menu
                      </span>
                    </SheetTitle>
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-4 mt-4" />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <div className="container mx-auto">
            <div className="flex items-center h-16 relative">
              <div className="flex space-x-4 px-6">
                {[1, 2].map((i) => (
                  <div key={i} className="py-3 px-6 bg-white/10 rounded-md w-32 animate-pulse" />
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
        <div className="mx-1.5 px-4 w-full">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent hover:from-orange-700 hover:to-orange-800 transition-all duration-200"
              >
                Sabecho
              </Link>

              {/* Search Bar - Desktop */}
              <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Input
                    type="search"
                    placeholder="Search products, categories..."
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 focus:border-orange-500 rounded-lg"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6">
                  Search
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-2">
                <Link href="/about" passHref>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium"
                  >
                    About Us
                  </Button>
                </Link>
                <Link href="/contact" passHref>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>

              {isLoggedIn ? (
                <div className="hidden md:flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="text-orange-600 border-orange-500 hover:bg-orange-600 hover:text-white font-medium bg-transparent"
                    onClick={handleDashboardRedirect}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <LoginButton className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200" />
              )}

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-gray-900">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-gradient-to-br from-orange-50 to-gray-50 p-0">
                  <SheetTitle className="flex items-center justify-between p-6 border-b bg-white">
                    <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                      Menu
                    </span>
                  </SheetTitle>

                  <div className="flex flex-col space-y-4 p-6">
                    {/* Mobile Search */}
                    <div className="relative">
                      <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-orange-500 rounded-lg"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <Link href="/about" passHref>
                        <Button
                          variant="outline"
                          className="w-full h-12 text-orange-600 border-orange-500 hover:bg-orange-600 hover:text-white text-base font-medium bg-transparent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          About Us
                        </Button>
                      </Link>
                      <Link href="/contact" passHref>
                        <Button
                          variant="outline"
                          className="w-full h-12 text-orange-600 border-orange-500 hover:bg-orange-600 hover:text-white text-base font-medium bg-transparent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Contact Us
                        </Button>
                      </Link>

                      {isLoggedIn ? (
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full h-12 text-orange-600 border-orange-500 hover:bg-orange-600 hover:text-white text-base font-medium bg-transparent"
                            onClick={handleDashboardRedirect}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full h-12 text-red-600 border-red-500 hover:bg-red-600 hover:text-white text-base font-medium bg-transparent"
                            onClick={handleLogout}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full">
                          <LoginButton className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-600 hover:to-orange-700 w-full h-12 text-base font-medium shadow-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
