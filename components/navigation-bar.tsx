"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronRight, MapPin, Grid3X3, Package, Grid2X2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import Link from "next/link"
import SearchCombobox from "./product-search"

interface Product {
  _id: string
  p_name: string
  location: string
  brand: string
  category: string
  subCategory: string
}

interface SubCategory {
  _id: string
  name: string
  product: Product[]
  id: number
  slug: string
}

interface Category {
  _id: string
  category: string
  subCategory: SubCategory[]
  id: number
  slug: string
}

interface NavigationBarProps {
  mobileView: boolean
}

export default function NavigationBar({ mobileView }: NavigationBarProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [hoveredSubCategory, setHoveredSubCategory] = useState<string | null>(null)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const API_URL = process.env.API_URL || "https://sabecho.com"
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
    fetchCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/v1/categories/all`)
      const data = await response.json()
      const enrichedData = data.map((category: Category) => ({
        ...category,
        subCategory: category.subCategory.map((subCat: SubCategory) => ({
          ...subCat,
          product: subCat.product.map((prod: Product) => ({
            ...prod,
            category: category.category,
            subCategory: subCat.name,
          })),
        })),
      }))
      setCategories(enrichedData)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([]) // Fallback to empty array
    } finally {
      setIsLoading(false)
    }
  }

  const generateSEOFriendlyURL = useCallback(
    (category: string, subCategory?: string, product?: string, location?: string) => {
      const parts = [category, subCategory, product, location].filter(Boolean)
      return `/products/${parts.join("/")}`.toLowerCase().replace(/\s+/g, "-")
    },
    []
  )

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    setSelectedSubCategory(null)
    setIsSheetOpen(true)
  }

  const handleSubCategoryClick = (subCat: SubCategory) => {
    setSelectedSubCategory(subCat)
  }

  const handleProductClick = (product: Product) => {
    if (selectedCategory && selectedSubCategory) {
      const url = generateSEOFriendlyURL(
        selectedCategory.category,
        selectedSubCategory.name,
        product.p_name,
        product.location
      )
      router.push(url)
      setIsSheetOpen(false)
    }
  }

  const handleAllCategoriesClick = () => {
    setSelectedCategory(null)
    setSelectedSubCategory(null)
    setIsSheetOpen(true)
  }

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return []
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
    const allProducts = categories.flatMap((category) =>
      category.subCategory.flatMap((subCat) => subCat.product)
    )
    const filteredResults = allProducts.filter((product) =>
      product.p_name.toLowerCase().includes(term.toLowerCase())
    )
    setSearchResults(filteredResults)
    return filteredResults
  }

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product)
    if (product) {
      const url = generateSEOFriendlyURL(
        product.category,
        product.subCategory,
        product.p_name,
        product.location
      )
      router.push(url)
    }
  }

  if (!isMounted) {
    return (
      <div className={mobileView ? "w-full" : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"}>
        {mobileView ? (
          <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Product Categories</h2>
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="container mx-auto">
            <div className="flex items-center h-16 relative">
              <div className="flex space-x-4">
                {[1, 2].map((i) => (
                  <div key={i} className="py-3 px-4 bg-white/10 rounded-md w-32 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={mobileView ? "w-full" : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"}>
        {mobileView ? (
          <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Product Categories</h2>
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="container mx-auto">
            <div className="flex items-center h-16 relative">
              <div className="flex space-x-4">
                {[1, 2].map((i) => (
                  <div key={i} className="py-3 px-4 bg-white/10 rounded-md w-32 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (mobileView) {
    return (
      <div className="w-full">
        <div className="p-4 space-y-3">
          <h2 className="text-lg font-bold text-gray-800">Product Categories</h2>
          <SearchCombobox<Product>
            label=""
            placeholder="Search products..."
            searchPlaceholder="Search products..."
            data={searchResults}
            value={selectedProduct}
            onChange={handleProductSelect}
            onSearch={handleSearch}
            displayField="p_name"
            valueField="_id"
            className="space-y-0"
          />
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full bg-white border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full h-10 px-4 flex items-center justify-between"
              onClick={handleAllCategoriesClick}
            >
              <div className="flex items-center space-x-2">
                <Grid2X2 className="w-5 h-5" />
                <span>All Categories</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>
            {categories.slice(0, 5).map((category) => (
              <Button
                key={category._id}
                variant="outline"
                className="w-full h-10 px-4 text-gray-700 border-gray-300 hover:bg-gray-100 rounded-full text-sm font-medium flex items-center justify-between"
                onClick={() => handleCategoryClick(category)}
              >
                <span>{category.category}</span>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </Button>
            ))}
            {categories.length > 5 && (
              <Button
                variant="outline"
                className="w-full h-10 px-4 text-blue-600 border-blue-500 hover:bg-blue-50 rounded-full text-sm font-medium"
                onClick={handleAllCategoriesClick}
              >
                Show All ({categories.length})
              </Button>
            )}
          </div>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-lg p-0">
            <SheetTitle className="flex items-center justify-between p-4 border-b bg-gray-50">
              <span className="text-lg font-bold text-gray-800">
                {selectedSubCategory
                  ? `${selectedSubCategory.name} Products`
                  : selectedCategory
                  ? `${selectedCategory.category} Subcategories`
                  : "All Categories"}
              </span>
            </SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4">
                {!selectedCategory && (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <span className="text-gray-800 font-medium text-base">{category.category}</span>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}
                {selectedCategory && !selectedSubCategory && (
                  <div className="space-y-2">
                    {selectedCategory.subCategory.map((subCat) => (
                      <div
                        key={subCat._id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSubCategoryClick(subCat)}
                      >
                        <span className="text-gray-700 font-medium text-sm">
                          {subCat.name} ({subCat.product.length})
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}
                {selectedCategory && selectedSubCategory && (
                  <div className="space-y-2">
                    {selectedSubCategory.product.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-600 text-sm truncate">
                            {product.p_name} - {product.location}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto">
        <div className="flex items-center h-16 relative">
          <div className="flex space-x-4">
            {categories.map((category) => (
              <Link key={category._id} href={generateSEOFriendlyURL(category.category)}>
                <button
                  className="py-3 px-4 text-white hover:text-blue-200 transition-colors font-medium"
                  onMouseEnter={() => {
                    setHoveredCategory(category.category)
                    setHoveredSubCategory(null)
                    setHoveredProduct(null)
                  }}
                >
                  {category.category}
                </button>
              </Link>
            ))}
          </div>

          {hoveredCategory && (
            <div
              className="absolute top-16 left-0 right-0 bg-white text-gray-900 shadow-md z-50 rounded-md border-t-2 border-blue-500"
              onMouseLeave={() => {
                setHoveredCategory(null)
                setHoveredSubCategory(null)
                setHoveredProduct(null)
              }}
            >
              <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-3 gap-6 min-h-60">
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-4 text-xl flex items-center">
                      <Grid3X3 className="w-6 h-6 mr-2" />
                      Subcategories
                    </h3>
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {categories
                        .find((cat) => cat.category === hoveredCategory)
                        ?.subCategory.map((subCat) => (
                          <Link
                            key={subCat._id}
                            href={generateSEOFriendlyURL(hoveredCategory, subCat.name)}
                          >
                            <div
                              className="group cursor-pointer"
                              onMouseEnter={() => {
                                setHoveredSubCategory(subCat.name)
                                setHoveredProduct(null)
                              }}
                            >
                              <div className="bg-blue-50 p-4 rounded-md hover:bg-blue-100 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-blue-800 text-md">{subCat.name}</h4>
                                    <p className="text-blue-600 text-sm mt-1">
                                      {subCat.product.length} products
                                    </p>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                  {hoveredSubCategory && (
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-4 text-xl flex items-center">
                        <Package className="w-6 h-6 mr-2" />
                        Products
                      </h3>
                      <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {categories
                          .find((cat) => cat.category === hoveredCategory)
                          ?.subCategory.find((sub) => sub.name === hoveredSubCategory)
                          ?.product.map((product) => (
                            <Link
                              key={product._id}
                              href={generateSEOFriendlyURL(hoveredCategory, hoveredSubCategory, product.p_name)}
                            >
                              <div
                                className="group cursor-pointer"
                                onMouseEnter={() => setHoveredProduct(product.p_name)}
                              >
                                <div className="bg-white p-4 rounded-md hover:bg-gray-50 transition-all duration-300 border border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-800 text-md">{product.p_name}</h4>
                                      <p className="text-gray-500 text-sm mt-1">
                                        {[...new Set([product.location])].length} cities
                                      </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                  {hoveredProduct && hoveredSubCategory && (
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-4 text-xl flex items-center">
                        <MapPin className="w-6 h-6 mr-2" />
                        Locations
                      </h3>
                      <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {categories
                          .find((cat) => cat.category === hoveredCategory)
                          ?.subCategory.find((sub) => sub.name === hoveredSubCategory)
                          ?.product.filter((prod) => prod.p_name === hoveredProduct)
                          .map((product) => (
                            <Link
                              key={product._id}
                              href={generateSEOFriendlyURL(
                                hoveredCategory,
                                hoveredSubCategory,
                                hoveredProduct,
                                product.location
                              )}
                            >
                              <div className="bg-blue-50 p-4 rounded-md hover:bg-blue-100 transition-all duration-300 cursor-pointer">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                    <MapPin className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-800 text-md">{product.location}</h4>
                                    <p className="text-gray-600 text-sm">Available now</p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    )
  }
