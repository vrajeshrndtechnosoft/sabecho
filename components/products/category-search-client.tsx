"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function CategorySearchClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")

  const handleSearch = (value: string) => {
    setSearchValue(value)
    const params = new URLSearchParams(searchParams.toString())

    if (value.trim()) {
      params.set("search", value)
    } else {
      params.delete("search")
    }

    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="relative mb-3 md:mb-4 lg:mb-6">
      <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
      <Input
        placeholder="Search categories..."
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-6 md:pl-8 lg:pl-10 h-7 md:h-8 lg:h-10 text-xs md:text-sm lg:text-base border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
      />
    </div>
  )
}
