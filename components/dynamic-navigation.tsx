"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import NavigationBar from "./navigation-bar"

export default function DynamicNavigation() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
    checkAuthStatus()
    setIsLoading(false)
  }, [pathname])

  const checkAuthStatus = () => {
    if (typeof window === "undefined") return
    try {
      const userData = localStorage.getItem("user")
      setIsLoggedIn(!!userData)
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsLoggedIn(false)
    }
  }

  const handleLogin = () => {
    router.push("/login")
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("user")
      }
      window.location.href = "/login"
    } catch (error) {
      console.error("Error during logout:", error)
    }
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
                <Button className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden text-gray-900">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 bg-gray-50 p-0">
                    <SheetTitle className="flex items-center justify-between p-4 border-b">
                      <span className="text-xl font-bold text-blue-600">Menu</span>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                          <X className="w-6 h-6 text-gray-900" />
                        </Button>
                      </SheetClose>
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
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="hidden md:inline-flex text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              )}
              <Link href="/register" className="hidden md:inline-flex">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
              </Link>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-gray-900">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-gray-50 p-0">
                  <SheetTitle className="flex items-center justify-between p-4 border-b">
                    <span className="text-xl font-bold text-blue-600">Menu</span>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="w-6 h-6 text-gray-900" />
                      </Button>
                    </SheetClose>
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
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-12 text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white text-base"
                          onClick={handleLogin}
                        >
                          Login
                        </Button>
                      )}
                      <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base">
                        Get Started
                      </Button>
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