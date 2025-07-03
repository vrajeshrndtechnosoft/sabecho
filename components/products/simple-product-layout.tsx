"use client"

import type React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DialogTitle } from "@/components/ui/dialog"
import SimpleCategorySidebar from "./simple-category-sidebar"

interface SimpleProductLayoutProps {
  children: React.ReactNode
}

export default function SimpleProductLayout({ children }: SimpleProductLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden p-4 bg-white shadow-sm sticky top-0 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 flex items-center h-10"
              aria-label="Open categories menu"
            >
              <Menu className="w-6 h-6" />
              <span className="ml-2 text-base font-medium">Categories</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <DialogTitle className="sr-only">Product Categories</DialogTitle>
            <div className="p-6 h-full overflow-y-auto">
              <SimpleCategorySidebar />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200">
          <SimpleCategorySidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-white min-h-screen">{children}</div>
    </div>
  )
}
