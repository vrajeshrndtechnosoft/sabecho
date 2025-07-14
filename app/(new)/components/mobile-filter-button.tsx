"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter } from "lucide-react"
import { ProductFilters } from "./product-filters"

interface Category {
  id: string
  name: string
  count: number
  children?: Category[]
}

interface MobileFilterButtonProps {
  categories: Category[]
}

export function MobileFilterButton({ categories }: MobileFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Fixed Filter Button - Mobile Only */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-l-none rounded-r-lg shadow-lg border-0 px-2 py-8 flex flex-col items-center justify-center min-h-[120px] w-12"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              <Filter className="w-4 h-4 mb-2" />
              <span className="text-xs font-bold tracking-wider">FILTER</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] p-0 overflow-y-auto">
            <SheetHeader className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Products
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="p-4">
              <ProductFilters categories={categories} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filter Results Badge - Mobile Only */}
      <div className="fixed left-0 bottom-20 z-40 md:hidden">
        <div className="bg-orange-500 text-white px-3 py-1 rounded-r-full text-xs font-medium shadow-lg">3 Results</div>
      </div>
    </>
  )
}
