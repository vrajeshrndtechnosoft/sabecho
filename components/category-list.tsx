/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Heart, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProductContext } from "./product-context"

const CategoryList: React.FC = () => {
  const router = useRouter()
  const context = useProductContext()

  // Local state for accordion expansion (separate from navigation)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Destructure with fallbacks
  const {
    categories = [],
    categorySearch = "",
    setCategorySearch = () => {},
    handleCategoryClick = () => {},
    handleSubCategoryClick = async () => {},
    handleProductClick = async () => {},
    handleLocationClick = async () => {},
    handleFavoriteToggle = async () => {},
    isProductFavorite = () => false,
    generateSEOFriendlyURL = () => "",
    selectedSubCategory = null,
    selectedProductName = "",
    selectedLocation = "",
    isLoading = false,
  } = context || {}

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.category.toLowerCase().includes(categorySearch.toLowerCase())),
    [categories, categorySearch],
  )

  // Toggle category expansion (UI only)
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
        // Also collapse all subcategories when category is collapsed
        setExpandedSubcategories((prevSub) => {
          const newSubSet = new Set(prevSub)
          const category = categories.find((cat) => cat._id === categoryId)
          if (category) {
            category.subCategory.forEach((sub) => newSubSet.delete(sub._id))
          }
          return newSubSet
        })
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Toggle subcategory expansion (UI only)
  const toggleSubcategoryExpansion = (subcategoryId: string) => {
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId)
        // Also collapse all products when subcategory is collapsed
        setExpandedProducts((prevProd) => {
          const newProdSet = new Set(prevProd)
          newProdSet.delete(subcategoryId)
          return newProdSet
        })
      } else {
        newSet.add(subcategoryId)
      }
      return newSet
    })
  }

  // Toggle product expansion (UI only)
  const toggleProductExpansion = (subcategoryId: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId)
      } else {
        newSet.add(subcategoryId)
      }
      return newSet
    })
  }

  // Navigation handlers (separate from UI expansion)
  const handleCategoryNavigation = async (categoryId: string, categoryName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const url = generateSEOFriendlyURL(categoryName)
      router.push(url)
      handleCategoryClick(categoryId)
    } catch (error) {
      console.error("Error navigating to category:", error)
    }
  }

  const handleSubCategoryNavigation = async (subCategory: any, categoryName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const url = generateSEOFriendlyURL(categoryName, subCategory.name)
      router.push(url)
      await handleSubCategoryClick(subCategory, categoryName)
    } catch (error) {
      console.error("Error navigating to subcategory:", error)
    }
  }

  const handleProductNavigation = async (product: any, categoryName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const subCategoryName = selectedSubCategory?.name || ""
      const url = generateSEOFriendlyURL(categoryName, subCategoryName, product.name)
      router.push(url)
      await handleProductClick(product, categoryName)
    } catch (error) {
      console.error("Error navigating to product:", error)
    }
  }

  const handleLocationNavigation = async (
    product: any,
    categoryName: string,
    location: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const subCategoryName = selectedSubCategory?.name || ""
      const url = generateSEOFriendlyURL(categoryName, subCategoryName, product.name, location)
      router.push(url)
      await handleLocationClick(product, categoryName, location)
    } catch (error) {
      console.error("Error navigating to location:", error)
    }
  }

  const getUniqueLocations = (products: any[]) => {
    const locations = new Set(products.map((p) => p.location))
    return Array.from(locations)
  }

  // Show loading or return null for SSR
  if (!isClient || !context || isLoading) {
    return (
      <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-0">
        <CardContent className="p-3 md:p-4 lg:p-5">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-0">
      <CardContent className="p-3 md:p-4 lg:p-5">
        <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6">
          <h2 className="text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900">Product Categories</h2>
        </div>

        <div className="relative mb-3 md:mb-4 lg:mb-6">
          <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          <Input
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="pl-6 md:pl-8 lg:pl-10 h-7 md:h-8 lg:h-10 text-xs md:text-sm lg:text-base border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
          />
        </div>

        <div className="space-y-1 md:space-y-2 lg:space-y-3">
          {filteredCategories.map((cat) => (
            <div key={cat._id} className="border-b border-gray-200">
              {/* Category Header */}
              <div className="flex items-center justify-between py-1.5 md:py-2 lg:py-3">
                <button
                  onClick={(e) => handleCategoryNavigation(cat._id, cat.category, e)}
                  className="flex-1 text-left text-gray-900 font-semibold hover:text-blue-600 text-xs md:text-sm lg:text-base transition-colors"
                >
                  {cat.category}
                </button>
                <button
                  onClick={() => toggleCategoryExpansion(cat._id)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label={expandedCategories.has(cat._id) ? "Collapse category" : "Expand category"}
                >
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedCategories.has(cat._id) ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Category Content */}
              {expandedCategories.has(cat._id) && (
                <div className="pb-2 pl-1 md:pl-2 lg:pl-4">
                  {cat.subCategory.map((sub) => (
                    <div key={sub._id} className="border-b border-gray-100 last:border-b-0">
                      {/* Subcategory Header */}
                      <div className="flex items-center justify-between py-1 md:py-1.5">
                        <button
                          onClick={(e) => handleSubCategoryNavigation(sub, cat.category, e)}
                          className={`flex-1 text-left text-gray-700 hover:text-blue-600 text-xs md:text-sm transition-colors ${
                            selectedSubCategory?._id === sub._id ? "text-blue-600 font-medium" : ""
                          }`}
                        >
                          <span className="truncate pr-1">{sub.name}</span>
                          <span className="text-xs text-gray-400 ml-1">
                            ({sub.distinctProductCount || sub.product.length})
                          </span>
                        </button>
                        <button
                          onClick={() => toggleSubcategoryExpansion(sub._id)}
                          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                          aria-label={
                            expandedSubcategories.has(sub._id) ? "Collapse subcategory" : "Expand subcategory"
                          }
                        >
                          <ChevronDown
                            className={`w-3 h-3 text-gray-400 transition-transform ${
                              expandedSubcategories.has(sub._id) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Subcategory Content */}
                      {expandedSubcategories.has(sub._id) && (
                        <div className="ml-2 md:ml-4 lg:ml-6 space-y-1">
                          {/* Show first 5 products */}
                          {sub.product.slice(0, expandedProducts.has(sub._id) ? sub.product.length : 5).map((prod) => (
                            <div key={prod._id} className="space-y-1">
                              <div className="flex items-center justify-between group">
                                <button
                                  onClick={(e) => handleProductNavigation(prod, cat.category, e)}
                                  className={`flex-1 text-left text-xs text-gray-600 hover:text-blue-500 transition-colors py-1 px-2 rounded-md truncate ${
                                    selectedProductName.toLowerCase().replace(/-/g, " ") === prod.name.toLowerCase() &&
                                    selectedSubCategory?.name === prod.categorySubType
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  • {prod.name}
                                </button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleFavoriteToggle(prod)
                                  }}
                                  className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                    isProductFavorite(prod.name)
                                      ? "text-red-500 hover:text-red-600 opacity-100"
                                      : "text-gray-400 hover:text-gray-500"
                                  }`}
                                  aria-label={
                                    isProductFavorite(prod.name) ? "Remove from favorites" : "Add to favorites"
                                  }
                                >
                                  <Heart
                                    className="w-3 h-3"
                                    fill={isProductFavorite(prod.name) ? "currentColor" : "none"}
                                  />
                                </Button>
                              </div>

                              {/* Show locations for the product */}
                              {selectedProductName.toLowerCase().replace(/-/g, " ") === prod.name.toLowerCase() && (
                                <div className="ml-4 space-y-0.5">
                                  {getUniqueLocations(sub.product.filter((p) => p.name === prod.name)).map(
                                    (location) => (
                                      <button
                                        key={location}
                                        onClick={(e) => handleLocationNavigation(prod, cat.category, location, e)}
                                        className={`block w-full text-left text-xs text-gray-500 hover:text-blue-400 py-0.5 px-2 rounded-md transition-colors ${
                                          selectedLocation.toLowerCase().replace(/-/g, " ") === location.toLowerCase()
                                            ? "bg-blue-100 text-blue-700 font-medium"
                                            : "hover:bg-gray-50"
                                        }`}
                                      >
                                        ◦ {location}
                                      </button>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Show more/less button */}
                          {sub.product.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProductExpansion(sub._id)}
                              className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 h-auto font-normal"
                            >
                              {expandedProducts.has(sub._id) ? (
                                <>
                                  <ChevronUp className="w-3 h-3 mr-1" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 mr-1" />+{sub.product.length - 5} more products
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-4 md:py-6 lg:py-8">
            <div className="text-gray-400 mb-2">
              <Search className="mx-auto h-6 w-6 md:h-8 md:w-8" />
            </div>
            <p className="text-xs md:text-sm text-gray-500">No categories found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default React.memo(CategoryList)
