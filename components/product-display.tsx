/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useMemo } from "react"
import Link from "next/link"
import { Search, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import RequirementsForm from "@/components/requirements-form"
import Breadcrumb from "@/components/breadcrumb"
import { useProductContext } from "./product-context"
import { getUniqueProducts } from "@/lib/utils"

interface ProductDisplayProps {
  category?: string
  subcategory?: string
  product?: string
  location?: string
}

// Product Row Component
const ProductRow = React.memo<{
  product: any
  catName: string
  isSelected: boolean
  selectedSubCategory: any
  onFavoriteToggle: (product: any) => void
  isProductFavorite: (productName: string) => boolean
  generateSEOFriendlyURL: (category: string, subCategory?: string, product?: string, location?: string) => string
}>(
  ({
    product,
    catName,
    isSelected,
    selectedSubCategory,
    onFavoriteToggle,
    isProductFavorite,
    generateSEOFriendlyURL,
  }) => (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 ${isSelected ? "bg-blue-100" : ""}`}>
      <td className="p-2 md:p-3">
        <Link
          href={generateSEOFriendlyURL(catName, selectedSubCategory?.name, product.name)}
          className="text-gray-600 hover:text-blue-500 font-medium text-sm md:text-base"
        >
          {product.name}
        </Link>
      </td>
      <td className="p-2 md:p-3 text-xs md:text-sm">{product.location}</td>
      <td className="p-2 md:p-3 text-xs md:text-sm hidden md:table-cell">{product.description}</td>
      <td className="p-2 md:p-3">
        <div className="flex items-center space-x-1 md:space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 h-7 md:h-9 text-xs md:text-sm bg-transparent px-2 md:px-3"
              >
                Inquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-[95vw] w-full sm:max-w-md md:max-w-3xl rounded-lg">
              <DialogTitle className="mt-4 md:mt-6 px-4 md:px-6 text-sm md:text-base">
                Inquiry for {product.name}
              </DialogTitle>
              <RequirementsForm
                initialProduct={{
                  _id: product._id,
                  location: product.location,
                  categoryType: catName,
                  categorySubType: selectedSubCategory?.name || "",
                  name: product.name,
                  measurementOptions: ["pieces", "dozens", "boxes"],
                  p_name: product.name,
                  brand: product.brand,
                }}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFavoriteToggle(product)}
            className={`p-1 md:p-2 ${isProductFavorite(product.name) ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-500"}`}
            aria-label={isProductFavorite(product.name) ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className="w-4 h-4 md:w-5 md:h-5" fill={isProductFavorite(product.name) ? "currentColor" : "none"} />
          </Button>
        </div>
      </td>
    </tr>
  ),
)

ProductRow.displayName = "ProductRow"

// Product Card Component for Mobile
const ProductCard = React.memo<{
  product: any
  catName: string
  isSelected: boolean
  selectedSubCategory: any
  onFavoriteToggle: (product: any) => void
  isProductFavorite: (productName: string) => boolean
  generateSEOFriendlyURL: (category: string, subCategory?: string, product?: string, location?: string) => string
}>(
  ({
    product,
    catName,
    isSelected,
    selectedSubCategory,
    onFavoriteToggle,
    isProductFavorite,
    generateSEOFriendlyURL,
  }) => (
    <div
      className={`border rounded-lg p-3 md:p-4 bg-white shadow-sm ${isSelected ? "ring-2 ring-blue-200 bg-blue-50" : "hover:shadow-md"}`}
    >
      <div className="space-y-2 md:space-y-3">
        <div>
          <span className="font-medium text-gray-700 text-xs md:text-sm">Product: </span>
          <Link
            href={generateSEOFriendlyURL(catName, selectedSubCategory?.name, product.name)}
            className="text-xs md:text-sm text-gray-600 hover:text-blue-500 font-medium"
          >
            {product.name}
          </Link>
        </div>
        <div>
          <span className="font-medium text-gray-700 text-xs md:text-sm">Location: </span>
          <span className="text-xs md:text-sm">{product.location}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700 text-xs md:text-sm">Description: </span>
          <span className="text-xs md:text-sm">{product.description}</span>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 pt-2 md:pt-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 md:h-9 text-xs md:text-sm bg-transparent flex-1 md:flex-none"
              >
                Send Inquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-[95vw] w-full sm:max-w-md rounded-lg">
              <DialogTitle className="mt-4 md:mt-6 px-4 md:px-6 text-sm md:text-base">
                Inquiry for {product.name}
              </DialogTitle>
              <RequirementsForm
                initialProduct={{
                  _id: product._id,
                  location: product.location,
                  categoryType: catName,
                  categorySubType: selectedSubCategory?.name || "",
                  name: product.name,
                  measurementOptions: ["pieces", "dozens", "boxes"],
                  p_name: product.name,
                  brand: product.brand,
                }}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFavoriteToggle(product)}
            className={`p-2 ${isProductFavorite(product.name) ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-500"}`}
            aria-label={isProductFavorite(product.name) ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className="w-4 h-4 md:w-5 md:h-5" fill={isProductFavorite(product.name) ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
    </div>
  ),
)

ProductCard.displayName = "ProductCard"

// Subcategory List Component
const SubcategoryList = React.memo<{
  category: any
  onSubCategoryClick: (subCategory: any, categoryName: string) => void
  generateSEOFriendlyURL: (category: string, subCategory?: string, product?: string, location?: string) => string
}>(({ category, onSubCategoryClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
    {category.subCategory.map((sub: any) => (
      <div key={sub._id} className="border rounded-lg p-3 md:p-4 lg:p-5 hover:shadow-lg transition-shadow bg-white">
        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2 md:mb-3">{sub.name}</h3>
        <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
          <p className="text-xs md:text-sm text-gray-600">
            {sub.distinctProductCount || sub.product.length} unique products
          </p>
          <p className="text-xs text-gray-500">{sub.product.length} total variants</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSubCategoryClick(sub, category.category)}
          className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs md:text-sm px-3 md:px-4 h-7 md:h-8 lg:h-10 w-full"
        >
          View Products
        </Button>
      </div>
    ))}
  </div>
))

SubcategoryList.displayName = "SubcategoryList"

// Global Search Results Component
const GlobalSearchResults = React.memo<{
  searchResults: any[]
  searchQuery: string
  onFavoriteToggle: (product: any) => void
  isProductFavorite: (productName: string) => boolean
  generateSEOFriendlyURL: (category: string, subCategory?: string, product?: string, location?: string) => string
}>(({ searchResults, searchQuery, onFavoriteToggle, isProductFavorite, generateSEOFriendlyURL }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Search Results for &quot;{searchQuery}&quot;</h2>
      <span className="text-sm text-gray-600">{searchResults.length} products found</span>
    </div>

    {/* Desktop Table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
            <th className="p-3 md:p-4 font-semibold">Product</th>
            <th className="p-3 md:p-4 font-semibold">Location</th>
            <th className="p-3 md:p-4 font-semibold">Category</th>
            <th className="p-3 md:p-4 font-semibold">Subcategory</th>
            <th className="p-3 md:p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {searchResults.map((product) => (
            <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-2 md:p-3">
                <Link
                  href={generateSEOFriendlyURL(product.categoryType, product.categorySubType, product.name)}
                  className="text-gray-600 hover:text-blue-500 font-medium text-sm md:text-base"
                >
                  {product.name}
                </Link>
              </td>
              <td className="p-2 md:p-3 text-xs md:text-sm">{product.location}</td>
              <td className="p-2 md:p-3 text-xs md:text-sm">{product.categoryType}</td>
              <td className="p-2 md:p-3 text-xs md:text-sm">{product.categorySubType}</td>
              <td className="p-2 md:p-3">
                <div className="flex items-center space-x-1 md:space-x-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50 h-7 md:h-9 text-xs md:text-sm bg-transparent px-2 md:px-3"
                      >
                        Inquiry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 max-w-[95vw] w-full sm:max-w-md md:max-w-3xl rounded-lg">
                      <DialogTitle className="mt-4 md:mt-6 px-4 md:px-6 text-sm md:text-base">
                        Inquiry for {product.name}
                      </DialogTitle>
                      <RequirementsForm
                        initialProduct={{
                          _id: product._id,
                          location: product.location,
                          categoryType: product.categoryType,
                          categorySubType: product.categorySubType,
                          name: product.name,
                          measurementOptions: ["pieces", "dozens", "boxes"],
                          p_name: product.name,
                          brand: product.brand,
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFavoriteToggle(product)}
                    className={`p-1 md:p-2 ${isProductFavorite(product.name) ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-500"}`}
                    aria-label={isProductFavorite(product.name) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill={isProductFavorite(product.name) ? "currentColor" : "none"}
                    />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Cards */}
    <div className="md:hidden space-y-3">
      {searchResults.map((product) => (
        <div key={product._id} className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md">
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700 text-xs">Product: </span>
              <Link
                href={generateSEOFriendlyURL(product.categoryType, product.categorySubType, product.name)}
                className="text-xs text-gray-600 hover:text-blue-500 font-medium"
              >
                {product.name}
              </Link>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Location: </span>
              <span className="text-xs">{product.location}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Category: </span>
              <span className="text-xs">
                {product.categoryType} → {product.categorySubType}
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 text-xs bg-transparent flex-1"
                  >
                    Send Inquiry
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-[95vw] w-full sm:max-w-md rounded-lg">
                  <DialogTitle className="mt-4 px-4 text-sm">Inquiry for {product.name}</DialogTitle>
                  <RequirementsForm
                    initialProduct={{
                      _id: product._id,
                      location: product.location,
                      categoryType: product.categoryType,
                      categorySubType: product.categorySubType,
                      name: product.name,
                      measurementOptions: ["pieces", "dozens", "boxes"],
                      p_name: product.name,
                      brand: product.brand,
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFavoriteToggle(product)}
                className={`p-2 ${isProductFavorite(product.name) ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-500"}`}
              >
                <Heart className="w-4 h-4" fill={isProductFavorite(product.name) ? "currentColor" : "none"} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
))

GlobalSearchResults.displayName = "GlobalSearchResults"

const ProductDisplay: React.FC<ProductDisplayProps> = ({ category, subcategory, product, location }) => {
  const {
    categories,
    isLoading,
    globalSearch,
    selectedSubCategory,
    selectedProductName,
    activeCategory,
    viewMode,
    handleSubCategoryClick,
    handleFavoriteToggle,
    isProductFavorite,
    generateSEOFriendlyURL,
    normalizeSegment,
    initializeFromParams,
    searchProducts,
  } = useProductContext()

  // Initialize from URL parameters
  useEffect(() => {
    initializeFromParams(category, subcategory, product, location)
  }, [category, subcategory, product, location, initializeFromParams])

  // Global search results
  const globalSearchResults = useMemo(() => {
    return globalSearch.trim() ? searchProducts(globalSearch) : []
  }, [globalSearch, searchProducts])

  // Memoized filtered products for subcategory view
  const filteredProducts = useMemo(() => {
    if (!selectedSubCategory) return []
    return getUniqueProducts(selectedSubCategory.product)
  }, [selectedSubCategory])

  // Show global search results if there's a global search query
  if (globalSearch.trim()) {
    return (
      <div className="p-3 md:p-4 lg:p-6 xl:p-8">
        <div className="max-w-7xl mx-auto">
          {globalSearchResults.length > 0 ? (
            <GlobalSearchResults
              searchResults={globalSearchResults}
              searchQuery={globalSearch}
              onFavoriteToggle={handleFavoriteToggle}
              isProductFavorite={isProductFavorite}
              generateSEOFriendlyURL={generateSEOFriendlyURL}
            />
          ) : (
            <div className="p-6 md:p-8 text-center text-gray-500 text-sm bg-white rounded-lg border">
              <Search className="mx-auto h-8 w-8 md:h-12 md:w-12 text-gray-300 mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">No products found</h3>
              <p>Try different search terms or browse categories.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render subcategory view
  const renderSubcategoryView = () => {
    if (!selectedSubCategory) {
      const selectedCategory = categories.find((cat) => cat._id === activeCategory)
      if (!selectedCategory)
        return <div className="p-4 md:p-6 text-gray-500 text-sm text-center">Category not found.</div>

      return (
        <>
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            {selectedCategory.category} Subcategories
          </h2>
          <SubcategoryList
            category={selectedCategory}
            onSubCategoryClick={handleSubCategoryClick}
            generateSEOFriendlyURL={generateSEOFriendlyURL}
          />
        </>
      )
    }

    return (
      <>
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
          {selectedSubCategory.name} Products
        </h2>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="p-3 md:p-4 font-semibold">Product</th>
                <th className="p-3 md:p-4 font-semibold">Location</th>
                <th className="p-3 md:p-4 font-semibold hidden md:table-cell">Description</th>
                <th className="p-3 md:p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => {
                  const catName =
                    categories.find((cat) => cat.subCategory.some((sub: any) => sub._id === selectedSubCategory._id))
                      ?.category || ""
                  return (
                    <ProductRow
                      key={prod._id}
                      product={prod}
                      catName={catName}
                      isSelected={!!product && normalizeSegment(product) === normalizeSegment(prod.name)}
                      selectedSubCategory={selectedSubCategory}
                      onFavoriteToggle={handleFavoriteToggle}
                      isProductFavorite={isProductFavorite}
                      generateSEOFriendlyURL={generateSEOFriendlyURL}
                    />
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 md:p-8 text-center text-gray-500 text-sm">
                    No products found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 md:space-y-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => {
              const catName =
                categories.find((cat) => cat.subCategory.some((sub: any) => sub._id === selectedSubCategory._id))
                  ?.category || ""
              return (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  catName={catName}
                  isSelected={!!product && normalizeSegment(product) === normalizeSegment(prod.name)}
                  selectedSubCategory={selectedSubCategory}
                  onFavoriteToggle={handleFavoriteToggle}
                  isProductFavorite={isProductFavorite}
                  generateSEOFriendlyURL={generateSEOFriendlyURL}
                />
              )
            })
          ) : (
            <div className="p-4 md:p-6 text-gray-500 text-sm text-center bg-white rounded-lg">
              No products found matching your search criteria.
            </div>
          )}
        </div>
      </>
    )
  }

  const renderProductView = () => {
    if (!selectedSubCategory || !selectedProductName)
      return <div className="p-4 md:p-6 text-gray-500 text-sm text-center">Product not found.</div>

    const productsWithSameName = getUniqueProducts(
      selectedSubCategory.product.filter(
        (prod: any) => normalizeSegment(prod.name) === normalizeSegment(selectedProductName),
      ),
    )

    return (
      <>
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6 capitalize">
          {selectedProductName.replace(/-/g, " ")}
        </h2>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="p-3 md:p-4 font-semibold">Product</th>
                <th className="p-3 md:p-4 font-semibold">Location</th>
                <th className="p-3 md:p-4 font-semibold">Description</th>
                <th className="p-3 md:p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsWithSameName.length > 0 ? (
                productsWithSameName.map((prod) => {
                  const catName =
                    categories.find((cat) => cat.subCategory.some((sub: any) => sub._id === selectedSubCategory._id))
                      ?.category || ""
                  return (
                    <ProductRow
                      key={prod._id}
                      product={prod}
                      catName={catName}
                      isSelected={!!product && normalizeSegment(product) === normalizeSegment(prod.name)}
                      selectedSubCategory={selectedSubCategory}
                      onFavoriteToggle={handleFavoriteToggle}
                      isProductFavorite={isProductFavorite}
                      generateSEOFriendlyURL={generateSEOFriendlyURL}
                    />
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 md:p-8 text-center text-gray-500 text-sm">
                    No products found for this name and location.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 md:space-y-4">
          {productsWithSameName.length > 0 ? (
            productsWithSameName.map((prod) => {
              const catName =
                categories.find((cat) => cat.subCategory.some((sub: any) => sub._id === selectedSubCategory._id))
                  ?.category || ""
              return (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  catName={catName}
                  isSelected={!!product && normalizeSegment(product) === normalizeSegment(prod.name)}
                  selectedSubCategory={selectedSubCategory}
                  onFavoriteToggle={handleFavoriteToggle}
                  isProductFavorite={isProductFavorite}
                  generateSEOFriendlyURL={generateSEOFriendlyURL}
                />
              )
            })
          ) : (
            <div className="p-4 md:p-6 text-gray-500 text-sm text-center bg-white rounded-lg">
              No products found for this name and location.
            </div>
          )}
        </div>
      </>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 md:h-48 lg:h-64">
        <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb />

        {viewMode === "subcategory" && renderSubcategoryView()}
        {viewMode === "product" && renderProductView()}
      </div>
    </div>
  )
}

ProductDisplay.displayName = "ProductDisplay"

export default ProductDisplay
