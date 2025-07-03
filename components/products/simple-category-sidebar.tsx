/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Search, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Product {
  _id: string
  name: string
  location: string
  description: string
  brand: string
  categoryType: string
  categorySubType: string
}

interface SubCategory {
  _id: string
  name: string
  product: Product[]
  distinctProductCount?: number
}

interface Category {
  _id: string
  category: string
  subCategory: SubCategory[]
}

export default function SimpleCategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [categorySearch, setCategorySearch] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/v1/categories/navbardata", {
          credentials: "include",
        })

        if (!response.ok) throw new Error("Failed to fetch categories")

        const data = await response.json()
        const dataArray = Array.isArray(data) ? data : [data]

        // Transform the data
        const transformedCategories: Category[] = []
        const categoryMap = new Map<string, Category>()

        dataArray.forEach((cat: any) => {
          cat.subCategory.forEach((sub: any) => {
            const products = sub.product.filter((prod: any) => prod && prod.p_name)
            if (products.length === 0) return

            const catName = cat.category || "Uncategorized"
            const subCatName = sub.name || "General"

            if (!categoryMap.has(catName)) {
              const newCategory: Category = {
                _id: cat._id || `cat_${catName}_${Math.random().toString(36).substr(2, 9)}`,
                category: catName,
                subCategory: [],
              }
              categoryMap.set(catName, newCategory)
              transformedCategories.push(newCategory)
            }

            const category = categoryMap.get(catName)!
            let subCategory = category.subCategory.find((s) => s.name === subCatName)

            if (!subCategory) {
              subCategory = {
                _id: sub._id || `sub_${subCatName}_${Math.random().toString(36).substr(2, 9)}`,
                name: subCatName,
                product: [],
                distinctProductCount: 0,
              }
              category.subCategory.push(subCategory)
            }

            const transformedProducts = products.map((prod: any) => ({
              _id: prod._id,
              name: prod.p_name,
              location: prod.location || "Unknown",
              description: prod.description || "No description available",
              brand: prod.brand || "No brand specified",
              categoryType: catName,
              categorySubType: subCatName,
            }))

            subCategory.product.push(...transformedProducts)
            subCategory.distinctProductCount = new Set(subCategory.product.map((p) => p.name.toLowerCase())).size
          })
        })

        // Filter out empty categories
        const filteredCategories = transformedCategories.filter((cat) => cat.subCategory.length > 0)

        setCategories(filteredCategories)
        console.log("Loaded categories:", filteredCategories.length)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Toggle functions
  const toggleCategory = (categoryId: string) => {
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

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId)
        // Also collapse products when subcategory is collapsed
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

  const toggleProducts = (subcategoryId: string) => {
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

  const toggleFavorite = (productName: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productName)) {
        newSet.delete(productName)
      } else {
        newSet.add(productName)
      }
      return newSet
    })
  }

  // Generate SEO-friendly URL
  const generateSEOFriendlyURL = (category?: string, subCategory?: string, product?: string, location?: string) => {
    const cleanPart = (part: string | undefined): string => {
      if (!part) return ""
      return part
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
    }

    const parts = [category, subCategory, product, location].filter(Boolean).map(cleanPart).filter(Boolean)
    return `/products/${parts.join("/")}`
  }

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.category.toLowerCase().includes(categorySearch.toLowerCase()),
  )

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-0">
      <CardContent className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Product Categories</h2>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-10 h-9 text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredCategories.map((category) => {
            const isCategoryExpanded = expandedCategories.has(category._id)

            return (
              <div key={category._id} className="border-b border-gray-200">
                {/* Category Header */}
                <div className="flex items-center justify-between py-3">
                  <Link
                    href={generateSEOFriendlyURL(category.category)}
                    className="flex-1 text-left text-gray-900 font-semibold hover:text-blue-600 text-sm transition-colors"
                  >
                    {category.category}
                  </Link>
                  <button
                    onClick={() => toggleCategory(category._id)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label={isCategoryExpanded ? "Collapse category" : "Expand category"}
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${isCategoryExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* Subcategories */}
                {isCategoryExpanded && (
                  <div className="pb-2 pl-4">
                    {category.subCategory.map((sub) => {
                      const isSubExpanded = expandedSubcategories.has(sub._id)
                      const areProductsExpanded = expandedProducts.has(sub._id)

                      return (
                        <div key={sub._id} className="border-b border-gray-100 last:border-b-0">
                          {/* Subcategory Header */}
                          <div className="flex items-center justify-between py-2">
                            <Link
                              href={generateSEOFriendlyURL(category.category, sub.name)}
                              className="flex-1 text-left text-gray-700 hover:text-blue-600 text-sm transition-colors"
                            >
                              <span className="truncate">{sub.name}</span>
                              <span className="text-xs text-gray-400 ml-2">
                                ({sub.distinctProductCount || sub.product.length})
                              </span>
                            </Link>
                            <button
                              onClick={() => toggleSubcategory(sub._id)}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                              aria-label={isSubExpanded ? "Collapse subcategory" : "Expand subcategory"}
                            >
                              <ChevronDown
                                className={`w-3 h-3 text-gray-400 transition-transform ${isSubExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>

                          {/* Products */}
                          {isSubExpanded && (
                            <div className="ml-4 space-y-1">
                              {/* Show first 5 products or all if expanded */}
                              {sub.product.slice(0, areProductsExpanded ? sub.product.length : 5).map((product) => {

                                return (
                                  <div key={product._id} className="space-y-1">
                                    {/* Product Row */}
                                    <div className="flex items-center justify-between group">
                                      <Link
                                        href={generateSEOFriendlyURL(category.category, sub.name, product.name)}
                                        className="flex-1 text-left text-xs text-gray-600 hover:text-blue-500 transition-colors py-1 px-2 rounded-md truncate hover:bg-gray-100"
                                      >
                                        • {product.name}
                                      </Link>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          toggleFavorite(product.name)
                                        }}
                                        className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                          favorites.has(product.name)
                                            ? "text-red-500 hover:text-red-600 opacity-100"
                                            : "text-gray-400 hover:text-gray-500"
                                        }`}
                                        aria-label={
                                          favorites.has(product.name) ? "Remove from favorites" : "Add to favorites"
                                        }
                                      >
                                        <Heart
                                          className="w-3 h-3"
                                          fill={favorites.has(product.name) ? "currentColor" : "none"}
                                        />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}

                              {/* Show more/less button */}
                              {sub.product.length > 5 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleProducts(sub._id)}
                                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 h-auto font-normal"
                                >
                                  {areProductsExpanded ? (
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
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Search className="mx-auto h-8 w-8" />
            </div>
            <p className="text-sm text-gray-500">No categories found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
