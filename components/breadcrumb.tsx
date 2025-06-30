"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useProductContext } from "./product-context"

const Breadcrumb: React.FC = () => {
  const {
    categories,
    selectedSubCategory,
    selectedProductName,
    selectedLocation,
    handleBackToCategories,
    handleBackToSubcategory,
    generateSEOFriendlyURL,
  } = useProductContext()

  const categoryName = selectedSubCategory
    ? categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category || ""
    : ""

  return (
    <div className="flex items-center text-sm text-gray-600 mb-6 space-x-2">
      <Link
        href={generateSEOFriendlyURL("")}
        onClick={handleBackToCategories}
        className="hover:text-blue-600 font-medium transition-colors"
      >
        Categories
      </Link>
      {selectedSubCategory && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={generateSEOFriendlyURL(categoryName)}
            className="hover:text-blue-600 font-medium transition-colors"
          >
            {categoryName}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={generateSEOFriendlyURL(categoryName, selectedSubCategory.name)}
            onClick={handleBackToSubcategory}
            className="hover:text-blue-600 font-medium transition-colors"
          >
            {selectedSubCategory.name}
          </Link>
        </>
      )}
      {selectedProductName && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-semibold capitalize">{selectedProductName.replace(/-/g, " ")}</span>
        </>
      )}
      {selectedLocation && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-semibold capitalize">{selectedLocation.replace(/-/g, " ")}</span>
        </>
      )}
    </div>
  )
}

export default React.memo(Breadcrumb)
