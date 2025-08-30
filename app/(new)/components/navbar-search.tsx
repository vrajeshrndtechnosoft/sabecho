"use client"

import type React from "react"
import {
  useState, useEffect, useRef, useCallback,
  forwardRef, useImperativeHandle
} from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// --- Types ---
interface NavbarProduct {
  _id: string
  location: string
  categoryType: string
  categorySubType: string
  name: string
  p_name: string
  brand: string
}

interface ApiProduct {
  _id: string
  location: string
  categoryType: string
  categorySubType: string
  name: string
  measurementOptions: string[]
  p_name: string
  brand: string
}

interface NavbarSearchProps {
  placeholder?: string
  className?: string
}

export type InputHandle = {
  focus: () => void
}

// --- CustomInput with forwarded ref ---
const CustomInput = forwardRef<InputHandle, React.ComponentPropsWithoutRef<"input">>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    },
  }))

  return <Input ref={inputRef} {...props} />
})
CustomInput.displayName = "CustomInput"

// --- Main Component ---
const NavbarSearch = forwardRef<InputHandle, NavbarSearchProps>(function NavbarSearch(
  { placeholder = "Search Products, Length, Height, Width and more...", className },
  ref
) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<NavbarProduct[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSearchTermRef = useRef<string>("")

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }))

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const generateSEOFriendlyURL = useCallback(
    (category: string, subCategory?: string, product?: string, location?: string) => {
      const cleanPart = (part: string | undefined): string => {
        if (!part) return ""
        return part
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      }

      const parts = [category, subCategory, product, location]
        .filter(Boolean)
        .map(cleanPart)
        .filter(Boolean)

      return `/products/${parts.join("/")}`
    },
    []
  )

  const searchProductsFromAPI = async (query: string): Promise<NavbarProduct[]> => {
    try {
      const response = await fetch(`/api/v1/products/search?query=${query}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data: ApiProduct[] = await response.json()
      return data.map((apiProduct) => ({
        _id: apiProduct._id,
        name: apiProduct.name,
        categoryType: apiProduct.categoryType,
        categorySubType: apiProduct.categorySubType,
        location: apiProduct.location,
        p_name: apiProduct.p_name || "",
        brand: apiProduct.brand || "",
      }))
    } catch (error) {
      console.error("Error fetching products from API:", error)
      return []
    }
  }

  const handleSearch = async (term: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (term === lastSearchTermRef.current) return
      lastSearchTermRef.current = term

      if (!term.trim()) {
        setSearchResults([])
        setIsSearchLoading(false)
        setOpen(false)
        return
      }

      setIsSearchLoading(true)
      setOpen(true)

      try {
        const results = await searchProductsFromAPI(term)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearchLoading(false)
        inputRef.current?.focus()
      }
    }, 300)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    handleSearch(newValue)
  }

  const handleSelectProduct = (product: NavbarProduct) => {
    const productURL = generateSEOFriendlyURL(
      product.categoryType,
      product.categorySubType,
      product.name,
      product.location
    )
    router.push(productURL)
    setSearchTerm("")
    setOpen(false)
    setSearchResults([])
  }

  const handleInputFocus = () => {
    if (searchTerm.trim() && searchResults.length > 0) {
      setOpen(true)
    }
  }

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
      setOpen(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (searchResults.length > 0) {
        handleSelectProduct(searchResults[0])
      } else if (searchTerm.trim()) {
        handleSearchClick()
      }
    }
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  if (!isMounted) {
    return (
      <div className={cn("flex items-center space-x-0 flex-1 max-w-xl", className)}>
        <Input
          placeholder={placeholder}
          disabled
          className="rounded-l-lg rounded-r-none border-r-0 focus:ring-0 focus:border-gray-300"
        />
        <Button disabled className="bg-gray-900 text-white rounded-l-none px-4">
          <Search className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center space-x-0 flex-1 max-w-xl", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1">
            <CustomInput
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyPress={handleKeyPress}
              className="rounded-l-lg rounded-r-none border-r-0 focus:ring-0 focus:border-gray-300 pr-8"
            />
            {isSearchLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="p-0"
          align="start"
          style={{ width: inputRef.current?.offsetWidth }}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-64 overflow-y-auto">
            {isSearchLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Searching...</span>
              </div>
            )}
            {!isSearchLoading && searchResults.length === 0 && searchTerm.trim() && (
              <div className="py-4 text-center text-sm text-gray-500">
                No products found for &quot;{searchTerm}&quot;
              </div>
            )}
            {!isSearchLoading && searchResults.length > 0 && (
              <div className="py-2">
                {searchResults.slice(0, 8).map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <Search className="mr-3 h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{product.p_name || product.name}</div>
                      <div className="text-xs text-gray-500">
                        {product.categoryType} • {product.categorySubType}
                      </div>
                      <div className="text-xs text-gray-400">
                        {product.location} {product.brand && `• ${product.brand}`}
                      </div>
                    </div>
                  </button>
                ))}
                {searchResults.length > 8 && (
                  <div className="px-4 py-2 text-xs text-gray-500 border-t">
                    +{searchResults.length - 8} more results
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button onClick={handleSearchClick} className="bg-gray-900 text-white hover:bg-gray-800 rounded-l-none px-4">
        <Search className="w-4 h-4" />
      </Button>
    </div>
  )
})

export default NavbarSearch
