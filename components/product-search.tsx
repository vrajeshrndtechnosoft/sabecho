"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Product } from "@/components/types"

// API Response type for the search endpoint
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

interface SearchComboboxProps {
  label?: string
  placeholder?: string
  value: Product | null
  onChange: (value: Product | null) => void
  onSearch?: (term: string) => Promise<Product[]> | Product[]
  error?: string
  className?: string
}

export default function SearchCombobox({
  label,
  placeholder = "Search products...",
  value,
  onChange,
  onSearch,
  error,
  className,
}: SearchComboboxProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSearchTermRef = useRef<string>("")

  // Set isMounted to true after component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // API search function
  const searchProductsFromAPI = async (query: string): Promise<Product[]> => {
    try {
      const response = await fetch(`http://localhost:3033/api/v1/search?query=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiProduct[] = await response.json()
      
      // Map API response to Product type
      return data.map((apiProduct: ApiProduct): Product => ({
        _id: apiProduct._id,
        name: apiProduct.name,
        categoryType: apiProduct.categoryType,
        categorySubType: apiProduct.categorySubType,
        location: apiProduct.location,
        measurementOptions: apiProduct.measurementOptions || [],
        p_name: apiProduct.p_name || "",
        brand: apiProduct.brand || ""
      }))
    } catch (error) {
      console.error('Error fetching products from API:', error)
      throw error
    }
  }

  // Handle search with debouncing
  const handleSearch = async (term: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (term === lastSearchTermRef.current) {
        return
      }

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
        let results: Product[]
        
        if (onSearch) {
          results = await onSearch(term)
        } else {
          results = await searchProductsFromAPI(term)
        }
        
        setSearchResults(results)
      } catch (error) {
        console.error("Error fetching search results:", error)
        setSearchResults([])
      } finally {
        setIsSearchLoading(false)
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
    }, 300)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    handleSearch(newValue)
  }

  // Handle product selection
  const handleSelectProduct = (product: Product) => {
    onChange(product)
    setSearchTerm(product.name)
    setOpen(false)
    setSearchResults([])
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 0)
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (searchTerm.trim() && searchResults.length > 0) {
      setOpen(true)
    }
  }

  // Handle clear selection
  const handleClear = () => {
    onChange(null)
    setSearchTerm("")
    setSearchResults([])
    setOpen(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  if (!isMounted) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <label className="text-sm font-medium text-white">{label}</label>}
        <Input
          placeholder={placeholder}
          disabled
          className="h-10 text-white"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className={cn("space-y-2 relative", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="h-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {isSearchLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              {!isSearchLoading && (
                <Search className="h-4 w-4 text-gray-400" />
              )}
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-full p-0" 
          align="start"
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
                {searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <Check
                      className={cn(
                        "mr-3 h-4 w-4",
                        value && value._id === product._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.categoryType} • {product.categorySubType}
                      </div>
                      <div className="text-xs text-gray-400">
                        {product.location}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}