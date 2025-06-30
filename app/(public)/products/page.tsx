/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useProductContext } from "@/components/product-context"

const ProductsPage: React.FC = () => {
  const router = useRouter()
  const { categories, isLoading, categorySearch, handleCategoryClick, generateSEOFriendlyURL } = useProductContext()

  // Filter categories based on search
  const filteredCategories = React.useMemo(
    () => categories.filter((cat) => cat.category.toLowerCase().includes(categorySearch.toLowerCase())),
    [categories, categorySearch],
  )

  const handleExploreCategory = (category: any) => {
    try {
      const url = generateSEOFriendlyURL(category.category)
      router.push(url)
      handleCategoryClick(category._id)
    } catch (error) {
      console.error("Error navigating to category:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Product Categories</h1>
          <p className="text-gray-600 text-lg">
            Browse through our comprehensive collection of product categories to find exactly what you need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="group border rounded-lg p-6 hover:shadow-lg transition-all duration-200 bg-white hover:border-blue-200 flex flex-col min-h-[280px]"
            >
              {/* Content Section - Takes up available space */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {category.category}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{category.subCategory.length} subcategories</p>
                  <p className="text-xs text-gray-500">
                    {category.subCategory.reduce((total, sub) => total + sub.product.length, 0)} total products
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Popular Subcategories:</p>
                  <div className="flex flex-wrap gap-1">
                    {category.subCategory.slice(0, 3).map((sub) => (
                      <span
                        key={sub._id}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {category.subCategory.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                        +{category.subCategory.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Button Section - Fixed at bottom */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExploreCategory(category)}
                  className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 text-sm px-4 h-10 group-hover:bg-blue-600 group-hover:text-white transition-all"
                >
                  Explore Category
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">Try adjusting your search terms or browse all available categories.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
