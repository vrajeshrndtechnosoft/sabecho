"use client"

import { ChevronDown } from "lucide-react"
import { useProductContext } from "./product-context"

interface CategoryToggleClientProps {
  categoryId: string
  isExpanded: boolean
}

export default function CategoryToggleClient({ categoryId, isExpanded }: CategoryToggleClientProps) {
  const { handleCategoryClick } = useProductContext()

  const toggleCategory = () => {
    handleCategoryClick(categoryId)
  }

  return (
    <button
      onClick={toggleCategory}
      className="p-1 hover:bg-gray-100 rounded-md transition-colors"
      aria-label={isExpanded ? "Collapse category" : "Expand category"}
    >
      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
    </button>
  )
}
