import type React from "react"
import { Suspense } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DialogTitle } from "@/components/ui/dialog"
import CategoryListServer from "./category-list-server"

interface ProductLayoutServerProps {
  children: React.ReactNode
  searchQuery?: string
  expandedCategories?: string[]
}

export default function ProductLayoutServer({ children, searchQuery, expandedCategories }: ProductLayoutServerProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden p-3 md:p-4 bg-white shadow-sm sticky top-0 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 flex items-center h-8 md:h-10"
              aria-label="Open categories menu"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
              <span className="ml-2 text-sm md:text-base font-medium">Categories</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 md:w-80 p-0">
            <DialogTitle className="sr-only">Product Categories</DialogTitle>
            <div className="p-3 md:p-6 h-full overflow-y-auto">
              <Suspense fallback={<CategoryListLoading />}>
                <CategoryListServer searchQuery={searchQuery} expandedCategories={expandedCategories} />
              </Suspense>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-72 xl:w-80 lg:flex-shrink-0">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto p-4 xl:p-6 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200">
          <Suspense fallback={<CategoryListLoading />}>
            <CategoryListServer searchQuery={searchQuery} expandedCategories={expandedCategories} />
          </Suspense>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-white min-h-screen">{children}</div>
    </div>
  )
}

function CategoryListLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>
  )
}
