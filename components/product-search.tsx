"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchComboboxProps<T> {
  label: string
  placeholder?: string
  searchPlaceholder?: string
  data: T[]
  value: T | null
  onChange: (value: T | null) => void
  onSearch: (term: string) => Promise<T[]> | T[]
  displayField: keyof T
  valueField: keyof T
  error?: string
  className?: string
}

export default function SearchCombobox<T extends Record<string, unknown>>({
  label,
  placeholder = "Select an item...",
  searchPlaceholder = "Search...",
  data,
  value,
  onChange,
  onSearch,
  displayField,
  valueField,
  error,
  className,
}: SearchComboboxProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<T[]>(data || [])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const lastSearchTermRef = useRef<string>("")

  // Set isMounted to true after component mounts on client
  useEffect(() => {
    setIsMounted(true)
    setSearchResults(data || []) // Initialize with data on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update searchResults when data changes, but only if not searching
  useEffect(() => {
    if (!searchTerm.trim() && !isSearchLoading) {
      setSearchResults(data || [])
    }
  }, [data, searchTerm, isSearchLoading])

  // Debounce function to delay search
  const debounce = (func: (...args: unknown[]) => void, delay: number) => {
    let timer: NodeJS.Timeout
    return (...args: unknown[]) => {
      clearTimeout(timer)
      timer = setTimeout(() => func(...args), delay)
    }
  }

  // Search handler
  const handleSearch = useCallback(
    async (term: string) => {
      if (term === lastSearchTermRef.current) {
        return // Avoid redundant searches
      }

      lastSearchTermRef.current = term

      if (!term.trim()) {
        setSearchResults(data || [])
        setIsSearchLoading(false)
        return
      }

      setIsSearchLoading(true)
      try {
        const results = await onSearch(term)
        setSearchResults(results)
      } catch (error) {
        console.error("Error fetching search results:", error)
        setSearchResults([])
      } finally {
        setIsSearchLoading(false)
      }
    },
    [onSearch, data]
  )

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(handleSearch, 300), [handleSearch])

  // Real-time search with useEffect, only run after mount
  useEffect(() => {
    if (isMounted) {
      debouncedSearch(searchTerm)
    }
  }, [searchTerm, debouncedSearch, isMounted])

  // Fallback UI during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className={cn("space-y-2", className)}>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <Button
          variant="outline"
          className="w-full justify-between h-10 text-left font-normal border-gray-300"
          disabled
        >
          <span className="truncate">{placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 text-left font-normal border-gray-300 hover:border-gray-400"
          >
            <span className="truncate">
              {value ? value[displayField] : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onValueChange={(value) => setSearchTerm(value)}
              className="h-9"
            />
            <CommandList className="max-h-64">
              {isSearchLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                </div>
              )}

              {!isSearchLoading && searchResults.length === 0 && (
                <CommandEmpty>No items found.</CommandEmpty>
              )}

              {!isSearchLoading && searchResults.length > 0 && (
                <CommandGroup>
                  {searchResults.map((item) => (
                    <CommandItem
                      key={item[valueField] as string}
                      value={item[displayField] as string}
                      onSelect={() => {
                        onChange(item)
                        setOpen(false)
                        setSearchTerm("")
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center w-full">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value && value[valueField] === item[valueField] ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item[displayField]}</div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}