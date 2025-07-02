"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"

interface CategoryToggleClientProps {
  categoryId: string
  isExpanded: boolean
}

export default function CategoryToggleClient({ categoryId, isExpanded }: CategoryToggleClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const toggleCategory = () => {
    const params = new URLSearchParams(searchParams.toString())
    const expanded = params.get("expanded")?.split(",").filter(Boolean) || []

    if (isExpanded) {
      const newExpanded = expanded.filter((id) => id !== categoryId)
      if (newExpanded.length > 0) {
        params.set("expanded", newExpanded.join(","))
      } else {
        params.delete("expanded")
      }
    } else {
      expanded.push(categoryId)
      params.set("expanded", expanded.join(","))
    }

    router.push(`/products?${params.toString()}`)
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
