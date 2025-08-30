"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Menu,
  Search,
  ChevronDown,
  ChevronRight,
  MapPin,
  Grid3X3,
  Package,
  Grid2X2,
  ChevronLeft,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import RequirementsFormDialog from "./requirements-form-dialog"
import type { Product } from "@/components/types"

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

interface StickyNavbarProps {
  onSearchClick?: () => void
}

export default function StickyNavbar({ onSearchClick }: StickyNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [hoveredSubCategory, setHoveredSubCategory] = useState<string | null>(null)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const categoriesRef = useRef<HTMLDivElement>(null)

  // NavigationBar state
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isRequirementsDialogOpen, setIsRequirementsDialogOpen] = useState(false)

  const navigationLinks = [
    { name: "Home", href: "/home" },
    { name: "About us", href: "/home/about-us" },
    { name: "Contact us", href: "/home/contact-us" },
    { name: "Get Quotation", href: "#", isDialog: true },
  ]

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close categories dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch categories
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/categories/all`)
      const data = await response.json()

      const enrichedData = data
        .map((category: Category) => ({
          ...category,
          subCategory: category.subCategory
            .filter((subCat: SubCategory) => subCat.product.length > 0)
            .map((subCat: SubCategory) => ({
              ...subCat,
              product: subCat.product.map((prod: Product) => ({
                _id: prod._id,
                location: prod.location || "Unknown",
                categoryType: category.category,
                categorySubType: subCat.name,
                name: prod.p_name,
                measurementOptions: [],
              })),
            })),
        }))
        .filter((category: Category) => category.subCategory.length > 0)

      setCategories(enrichedData)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

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

      const parts = [category, subCategory, product, location].filter(Boolean).map(cleanPart).filter(Boolean)

      return `/products/${parts.join("/")}`
    },
    [],
  )

  // NavigationBar helper functions
  const getUniqueProducts = (subCategory: SubCategory) => {
    const uniqueProducts = new Map<string, Product>()
    subCategory.product.forEach((product) => {
      if (!uniqueProducts.has(product.name)) {
        uniqueProducts.set(product.name, product)
      }
    })
    return Array.from(uniqueProducts.values())
  }

  const getProductLocations = (subCategory: SubCategory, productName: string) => {
    return [
      ...new Set(
        subCategory.product.filter((product) => product.name === productName).map((product) => product.location),
      ),
    ]
  }

  // Mobile navigation handlers
  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    setSelectedSubCategory(null)
    setSelectedProduct(null)
    setIsSheetOpen(true)
  }

  const handleSubCategoryClick = (subCat: SubCategory) => {
    setSelectedSubCategory(subCat)
    setSelectedProduct(null)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleLocationClick = (location: string) => {
    if (selectedCategory && selectedSubCategory && selectedProduct) {
      const url = generateSEOFriendlyURL(
        selectedCategory.category,
        selectedSubCategory.name,
        selectedProduct.name,
        location,
      )
      router.push(url)
      setIsSheetOpen(false)
    }
  }

  const handleAllCategoriesClick = () => {
    setSelectedCategory(null)
    setSelectedSubCategory(null)
    setSelectedProduct(null)
    setIsSheetOpen(true)
  }

  const handleBackClick = () => {
    if (selectedProduct) {
      setSelectedProduct(null)
    } else if (selectedSubCategory) {
      setSelectedSubCategory(null)
    } else if (selectedCategory) {
      setSelectedCategory(null)
    }
  }

  const getActiveLink = () => {
    return navigationLinks.find((link) => link.href === pathname) ? pathname : null
  }

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen)
  }

const CategoriesDropdown = () => (
  <div className="absolute top-full left-0 mt-1 z-50 w-auto max-w-[95vw] overflow-x-auto">
    <div className="bg-white text-gray-900 shadow-2xl rounded-lg border border-gray-200 overflow-hidden min-w-5xl">
      <div className="flex">
        {/* Categories Column */}
        <div className="w-5xl border-r border-gray-200 bg-gray-50">
          <div className="p-4 bg-orange-500 text-white">
            <h3 className="flex items-center text-sm font-semibold">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Categories
            </h3>
          </div>    
          <div className="max-h-80 overflow-y-auto">
            {categories.map((category, categoryIndex) => (
              <div key={category._id} className="relative group">
                <Link
                  href={generateSEOFriendlyURL(category.category)}
                  className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                  onClick={() => setIsCategoriesOpen(false)}
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{category.category}</div>
                    <div className="text-xs text-gray-500">{category.subCategory.length} subcategories</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                
                {/* Subcategories Panel */}
                <div 
                  className={`absolute top-0 w-96 bg-white border border-gray-200 shadow-xl z-[60] max-h-80 overflow-y-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                    categoryIndex >= Math.floor(categories.length / 2) 
                      ? 'right-full mr-1' 
                      : 'left-full ml-1'
                  }`}
                >
                  <div className="p-4 bg-orange-500 text-white">
                    <h4 className="flex items-center text-sm font-semibold">
                      <Package className="w-4 h-4 mr-2" />
                      Subcategories
                    </h4>
                  </div>
                  <div>
                    {category.subCategory.map((subCat) => (
                      <div key={subCat._id} className="relative group/sub">
                        <Link
                          href={generateSEOFriendlyURL(category.category, subCat.name)}
                          className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{subCat.name}</div>
                            <div className="text-xs text-gray-500">{getUniqueProducts(subCat).length} products</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                        
                        {/* Products Panel */}
                        {getUniqueProducts(subCat).length > 0 && (
                          <div 
                            className={`absolute top-0 w-96 bg-white border border-gray-200 shadow-xl z-[70] max-h-80 overflow-y-auto opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 ${
                              categoryIndex >= Math.floor(categories.length / 2)
                                ? 'right-full mr-1'
                                : 'left-full ml-1'
                            }`}
                          >
                            <div className="p-4 bg-orange-500 text-white">
                              <h5 className="flex items-center text-sm font-semibold">
                                <Package className="w-4 h-4 mr-2" />
                                Products
                              </h5>
                            </div>
                            <div>
                              {getUniqueProducts(subCat).slice(0, 10).map((product) => (
                                <div key={product._id} className="relative group/product">
                                  <Link
                                    href={generateSEOFriendlyURL(category.category, subCat.name, product.name)}
                                    className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                                    onClick={() => setIsCategoriesOpen(false)}
                                  >
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                                      <div className="text-xs text-gray-500">
                                        Available in {getProductLocations(subCat, product.name).length} locations
                                      </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  </Link>
                                  
                                  {/* Locations Panel */}
                                  <div 
                                    className={`absolute top-0 w-80 bg-white border border-gray-200 shadow-xl z-[80] max-h-60 overflow-y-auto opacity-0 invisible group-hover/product:opacity-100 group-hover/product:visible transition-all duration-200 ${
                                      categoryIndex >= Math.floor(categories.length / 2)
                                        ? 'left-full ml-1'
                                        : 'right-full mr-1'
                                    }`}
                                  >
                                    <div className="p-4 bg-orange-500 text-white">
                                      <h6 className="flex items-center text-sm font-semibold">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Locations
                                      </h6>
                                    </div>
                                    <div>
                                      {[...new Set(getProductLocations(subCat, product.name))].map((location, index) => (
                                        <Link
                                          key={index}
                                          href={generateSEOFriendlyURL(category.category, subCat.name, product.name, location)}
                                          className="flex items-center p-4 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                                          onClick={() => setIsCategoriesOpen(false)}
                                        >
                                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                            <MapPin className="w-3 h-3 text-white" />
                                          </div>
                                          <div>
                                            <div className="font-medium text-gray-900 text-sm">{location}</div>
                                            <div className="text-xs text-gray-500">Available now</div>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {getUniqueProducts(subCat).length > 10 && (
                                <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-100">
                                  +{getUniqueProducts(subCat).length - 10} more products
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

  return (
    <>
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Left side - SABECHO Brand and Categories */}
            <div className="flex items-center space-x-6">
              {/* SABECHO Brand - Only shows when scrolled */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  isScrolled ? "opacity-100 translate-x-0 visible" : "opacity-0 -translate-x-4 invisible"
                }`}
              >
                <Link
                  href="/"
                  className="text-xl font-bold text-white tracking-wider hover:text-orange-400 transition-colors duration-300"
                >
                  SABECHO
                </Link>
              </div>

              {/* Categories Section - Always visible */}
              <div className="relative" ref={categoriesRef}>
                <Button
                  className="bg-gray-900 text-white hover:bg-gray-800 border border-gray-600 transition-all duration-200"
                  onClick={toggleCategories}
                >
                  <Menu className="w-4 h-4 mr-2" />
                  CATEGORIES
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${isCategoriesOpen ? "rotate-180" : ""}`}
                  />
                </Button>

                {/* Desktop Dropdown Menu - Click to open */}
                {isCategoriesOpen && !isLoading && <CategoriesDropdown />}
              </div>
            </div>

            {/* Right side - Navigation Links, Search, and Login */}
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="hidden lg:flex items-center space-x-1">
                {navigationLinks.map((link) =>
                  link.isDialog ? (
                    <button
                      key={link.name}
                      onClick={() => setIsRequirementsDialogOpen(true)}
                      className="font-medium transition-all duration-300 text-white hover:text-orange-400 px-4 py-2 rounded-md hover:bg-gray-800 text-sm whitespace-nowrap"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`font-medium transition-all duration-300 px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                        getActiveLink() === link.href
                          ? "text-orange-400 bg-gray-800"
                          : "text-white hover:text-orange-400 hover:bg-gray-800"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ),
                )}
              </div>

              {/* Search Button - Hidden when not scrolled, visible when scrolled */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  isScrolled ? "opacity-100 translate-x-0 visible" : "opacity-0 translate-x-4 invisible"
                }`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-gray-800 hover:text-orange-400 transition-colors"
                  onClick={onSearchClick}
                  title="Search Products"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>

              {/* Login Button - Hidden when not scrolled, visible when scrolled */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  isScrolled ? "opacity-100 translate-x-0 visible" : "opacity-0 translate-x-4 invisible"
                }`}
              >
                <Button
                  variant="outline"
                  className="hidden sm:flex items-center space-x-2 bg-transparent border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[300px] sm:w-[400px] bg-gradient-to-br from-gray-50 to-orange-50"
                  >
                    <div className="flex flex-col space-y-4 mt-8">
                      {/* Mobile Header */}
                      <div className="text-center pb-4 border-b border-gray-200">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                          SABECHO
                        </h2>
                        <p className="text-sm text-gray-600">Navigation Menu</p>
                      </div>

                      {/* Mobile Search */}
                      <div className="pb-4 border-b border-gray-200">
                        <Button
                          variant="outline"
                          className="w-full bg-white border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full h-12 px-4 flex items-center justify-center space-x-2"
                          onClick={() => {
                            onSearchClick?.()
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          <Search className="w-5 h-5" />
                          <span>Search Products</span>
                        </Button>
                      </div>

                      {/* Mobile Navigation Links */}
                      <div className="space-y-2">
                        {navigationLinks.map((link) =>
                          link.isDialog ? (
                            <button
                              key={link.name}
                              onClick={() => {
                                setIsRequirementsDialogOpen(true)
                                setIsMobileMenuOpen(false)
                              }}
                              className="w-full text-left px-4 py-3 text-lg font-medium transition-colors hover:text-orange-500 hover:bg-orange-50 rounded-lg border border-transparent hover:border-orange-200"
                            >
                              {link.name}
                            </button>
                          ) : (
                            <Link
                              key={link.name}
                              href={link.href}
                              className={`block px-4 py-3 text-lg font-medium transition-colors rounded-lg border ${
                                getActiveLink() === link.href
                                  ? "text-orange-600 bg-orange-50 border-orange-200"
                                  : "text-gray-700 hover:text-orange-500 hover:bg-orange-50 border-transparent hover:border-orange-200"
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {link.name}
                            </Link>
                          ),
                        )}
                      </div>

                      {/* Mobile Login */}
                      <div className="pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          className="w-full bg-white border-green-500 text-green-600 hover:bg-green-50 rounded-full h-12 px-4 flex items-center justify-center space-x-2"
                        >
                          <User className="w-5 h-5" />
                          <span>Login / Register</span>
                        </Button>
                      </div>

                      {/* Mobile Categories Button */}
                      <div className="pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          className="w-full bg-white border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full h-12 px-4 flex items-center justify-between"
                          onClick={() => {
                            handleAllCategoriesClick()
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <Grid2X2 className="w-5 h-5" />
                            <span>Browse Categories</span>
                          </div>
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Categories Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-lg p-0">
          <SheetTitle className="flex items-center justify-between p-4 border-b bg-gray-50">
            {(selectedCategory || selectedSubCategory || selectedProduct) && (
              <Button variant="ghost" className="p-0 h-8 w-8" onClick={handleBackClick}>
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </Button>
            )}
            <span className="text-lg font-bold text-gray-800 flex-1 text-center">
              {selectedProduct
                ? `${selectedProduct.name} Locations`
                : selectedSubCategory
                  ? `${selectedSubCategory.name} Products`
                  : selectedCategory
                    ? `${selectedCategory.category} Subcategories`
                    : "All Categories"}
            </span>
            {(selectedCategory || selectedSubCategory || selectedProduct) && <div className="w-8" />}
          </SheetTitle>

          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              {/* All Categories */}
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

              {/* Subcategories */}
              {selectedCategory && !selectedSubCategory && (
                <div className="space-y-2">
                  {selectedCategory.subCategory.map((subCat) => (
                    <div
                      key={subCat._id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSubCategoryClick(subCat)}
                    >
                      <span className="text-gray-700 font-medium text-sm">
                        {subCat.name} ({getUniqueProducts(subCat).length} products)
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* Products */}
              {selectedCategory && selectedSubCategory && !selectedProduct && (
                <div className="space-y-2">
                  {getUniqueProducts(selectedSubCategory).map((product) => (
                    <div
                      key={product._id}
                      className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm">{product.name}</h4>
                            <p className="text-gray-600 text-xs">
                              Available in {getProductLocations(selectedSubCategory, product.name).length} locations
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Locations */}
              {selectedCategory && selectedSubCategory && selectedProduct && (
                <div className="space-y-2">
                  {getProductLocations(selectedSubCategory, selectedProduct.name).map((location, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 p-4 rounded-md hover:bg-blue-100 transition-all duration-300 cursor-pointer"
                      onClick={() => handleLocationClick(location)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-md">{location}</h4>
                          <p className="text-gray-600 text-sm">Available now</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Requirements Form Dialog */}
      <RequirementsFormDialog open={isRequirementsDialogOpen} onOpenChange={setIsRequirementsDialogOpen} />
    </>
  )
}
