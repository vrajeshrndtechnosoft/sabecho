'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import NavigationBar from './navigation-bar'; // Assuming NavigationBar is in the same directory

export default function DynamicNavigation() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Function to check authentication status from localStorage
  const checkAuthStatus = () => {
    try {
      const userData = localStorage.getItem("user");
      setIsLoggedIn(!!userData);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsLoggedIn(false);
    }
  };

  // useEffect to check authentication status
  useEffect(() => {
    checkAuthStatus();
    setIsLoading(false);
  }, [pathname]);

  // Handle login click
  const handleLogin = () => {
    router.push("/login");
    setIsMobileMenuOpen(false);
  };

  // Handle logout click
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Show loading skeleton if data is loading
  if (isLoading) {
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
                <Button className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden text-gray-900">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="flex flex-col space-y-4 mt-8">
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center h-16 relative">
              <div className="flex space-x-4 px-6">
                {[1, 2, 3].map((i) => (
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
    );
  }

  return (
    <div>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
                Sabecho
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <Button variant="outline" className="hidden md:inline-flex text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button variant="outline" className="hidden md:inline-flex text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white" onClick={handleLogin}>
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
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="border-t pt-4">
                      <NavigationBar mobileView={true} />
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      {isLoggedIn ? (
                        <Button variant="outline" className="w-full text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white" onClick={handleLogout}>
                          Logout
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white" onClick={handleLogin}>
                          Login
                        </Button>
                      )}
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
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
  );
}