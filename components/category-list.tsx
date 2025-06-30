/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Heart, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProductContext } from "./product-context"

const CategoryList: React.FC = () => {
  const router = useRouter()
  const {
    categories,
    categorySearch,
    setCategorySearch,
    handleCategoryClick,
    handleSubCategoryClick,
    handleProductClick,
    handleLocationClick,
    handleFavoriteToggle,
    isProductFavorite,
    generateSEOFriendlyURL,
    activeCategory,
    activeSubCategory,
    selectedSubCategory,
    selectedProductName,
    selectedLocation,
    setActiveCategory,
    setActiveSubCategory,
  } = useProductContext()

  // State for managing expanded products in subcategories
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.category.toLowerCase().includes(categorySearch.toLowerCase())),
    [categories, categorySearch],
  )

  // Safe function wrappers to prevent errors
  const safeSetActiveCategory = React.useCallback(
    (value: string) => {
      if (typeof setActiveCategory === "function") {
        setActiveCategory(value)
      }
    },
    [setActiveCategory],
  )

  const safeSetActiveSubCategory = React.useCallback(
    (value: string) => {
      if (typeof setActiveSubCategory === "function") {
        setActiveSubCategory(value)
      }
    },
    [setActiveSubCategory],
  )

  const handleSubCategorySelection = async (subCategory: any, categoryName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Navigate to the subcategory URL
      const url = generateSEOFriendlyURL(categoryName, subCategory.name)
      router.push(url)

      // Update accordion state
      const categoryObj = categories.find((cat) => cat.category === categoryName)
      if (categoryObj) {
        safeSetActiveCategory(categoryObj._id)
      }
      safeSetActiveSubCategory(subCategory._id)

      // Handle the subcategory click
      await handleSubCategoryClick(subCategory, categoryName)
    } catch (error) {
      console.error("Error navigating to subcategory:", error)
    }
  }

  const handleCategorySelection = (categoryId: string, categoryName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Navigate to the category URL
      const url = generateSEOFriendlyURL(categoryName)
      router.push(url)

      // Toggle category accordion
      if (activeCategory === categoryId) {
        safeSetActiveCategory("")
        safeSetActiveSubCategory("")
      } else {
        safeSetActiveCategory(categoryId)
        safeSetActiveSubCategory("")
      }

      handleCategoryClick(categoryId)
    } catch (error) {
      console.error("Error navigating to category:", error)
    }
  }

  const handleProductSelection = async (product: any, categoryName: string, e: React.MouseEvent) => {
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

  const handleLocationSelection = async (product: any, categoryName: string, location: string, e: React.MouseEvent) => {
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

  const toggleExpandedSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId)
      } else {
        newSet.add(subcategoryId)
      }
      return newSet
    })
  }

  const getUniqueLocations = (products: any[]) => {
    const locations = new Set(products.map((p) => p.location))
    return Array.from(locations)
  }

  // Don't render if context functions are not available
  if (!setActiveCategory || !setActiveSubCategory) {
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

        <Accordion
          type="single"
          collapsible
          value={activeCategory || undefined}
          onValueChange={(value) => safeSetActiveCategory(value || "")}
          className="space-y-1 md:space-y-2 lg:space-y-3"
        >
          {filteredCategories.map((cat) => (
            <AccordionItem key={cat._id} value={cat._id} className="border-b border-gray-200">
              <AccordionTrigger className="text-gray-900 font-semibold hover:text-blue-600 text-xs md:text-sm lg:text-base py-1.5 md:py-2 lg:py-3">
                <button
                  onClick={(e) => handleCategorySelection(cat._id, cat.category, e)}
                  className="w-full text-left hover:text-blue-600 transition-colors"
                >
                  {cat.category}
                </button>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <Accordion
                  type="single"
                  collapsible
                  value={activeSubCategory || undefined}
                  onValueChange={(value) => safeSetActiveSubCategory(value || "")}
                  className="space-y-0.5 md:space-y-1 pl-1 md:pl-2 lg:pl-4"
                >
                  {cat.subCategory.map((sub) => (
                    <AccordionItem key={sub._id} value={sub._id} className="border-b border-gray-100 last:border-b-0">
                      <AccordionTrigger
                        className={`text-gray-700 hover:text-blue-600 text-xs md:text-sm py-1 md:py-1.5 ${
                          selectedSubCategory?._id === sub._id ? "text-blue-600 font-medium" : ""
                        }`}
                      >
                        <button
                          onClick={(e) => handleSubCategorySelection(sub, cat.category, e)}
                          className="w-full flex justify-between text-left h-auto p-0 font-normal hover:bg-transparent"
                        >
                          <span className="flex-1 text-left truncate pr-1">{sub.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            ({sub.distinctProductCount || sub.product.length})
                          </span>
                        </button>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="ml-2 md:ml-4 lg:ml-6 space-y-1">
                          {/* Show first 5 products */}
                          {sub.product
                            .slice(0, expandedSubcategories.has(sub._id) ? sub.product.length : 5)
                            .map((prod) => (
                              <div key={prod._id} className="space-y-1">
                                <div className="flex items-center justify-between group">
                                  <button
                                    onClick={(e) => handleProductSelection(prod, cat.category, e)}
                                    className={`flex-1 text-left text-xs text-gray-600 hover:text-blue-500 transition-colors py-1 px-2 rounded-md truncate ${
                                      selectedProductName.toLowerCase().replace(/-/g, " ") ===
                                        prod.name.toLowerCase() && selectedSubCategory?.name === prod.categorySubType
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
                                          onClick={(e) => handleLocationSelection(prod, cat.category, location, e)}
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
                              onClick={() => toggleExpandedSubcategory(sub._id)}
                              className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 h-auto font-normal"
                            >
                              {expandedSubcategories.has(sub._id) ? (
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
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

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
