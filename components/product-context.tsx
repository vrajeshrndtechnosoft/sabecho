/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react"
import { toast } from "sonner"

// Interfaces
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
  id: number
  distinctProductCount?: number
}

interface Category {
  _id: string
  category: string
  subCategory: SubCategory[]
  id: number
}

interface Favorite {
  _id: string
  name: string
  priority: number
  createdAt: string
}

interface TokenResponse {
  email: string
  exp: number
  iat: number
  userId: string
  userType: string
}

type ViewMode = "categories" | "subcategory" | "product"

interface ProductContextType {
  // Data
  categories: Category[]
  favorites: Favorite[]
  allProducts: Product[]

  // UI State
  isLoading: boolean
  categorySearch: string
  productSearch: string
  globalSearch: string
  selectedSubCategory: SubCategory | null
  selectedProductName: string
  selectedLocation: string
  activeCategory: string
  activeSubCategory: string
  viewMode: ViewMode
  isSidebarOpen: boolean

  // User State
  isUserLoggedIn: boolean
  userEmail: string

  // Actions
  setCategorySearch: (value: string) => void
  setProductSearch: (value: string) => void
  setGlobalSearch: (value: string) => void
  setIsSidebarOpen: (value: boolean) => void
  setActiveCategory: (value: string) => void
  setActiveSubCategory: (value: string) => void
  handleCategoryClick: (categoryId: string) => void
  handleSubCategoryClick: (subCategory: SubCategory, categoryName: string) => Promise<void>
  handleProductClick: (product: Product, categoryName: string) => Promise<void>
  handleLocationClick: (product: Product, categoryName: string, location: string) => Promise<void>
  handleFavoriteToggle: (product: Product) => Promise<void>
  handleBackToCategories: () => void
  handleBackToSubcategory: () => void

  // Utilities
  isProductFavorite: (productName: string) => boolean
  generateSEOFriendlyURL: (category: string, subCategory?: string, product?: string, location?: string) => string
  normalizeSegment: (segment: string) => string
  getDistinctProductCount: (products: Product[]) => number
  searchProducts: (query: string) => Product[]
  getUniqueProducts: (products: Product[]) => Product[]

  // Navigation
  initializeFromParams: (category?: string, subcategory?: string, product?: string, location?: string) => void
  onNavigate?: (category?: string, subcategory?: string, product?: string, location?: string) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export const useProductContext = () => {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider")
  }
  return context
}

interface ProductProviderProps {
  children: React.ReactNode
  onNavigate?: (category?: string, subcategory?: string, product?: string, location?: string) => void
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children, onNavigate }) => {
  // State management
  const [categories, setCategories] = useState<Category[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [globalSearch, setGlobalSearch] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null)
  const [selectedProductName, setSelectedProductName] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("")
  const [activeSubCategory, setActiveSubCategory] = useState<string>("")
  const [viewMode, setViewMode] = useState<ViewMode>("categories")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")

  // Refs
  const initializedRef = useRef(false)

  // Utility functions
  const normalizeSegment = useCallback((segment = "") => {
    return segment.toLowerCase().replace(/-/g, " ")
  }, [])

  const generateSEOFriendlyURL = useCallback(
    (category: string, subCategory?: string, product?: string, location?: string) => {
      const parts = [category, subCategory, product, location].filter(Boolean)
      return `/products/${parts.join("/")}`.toLowerCase().replace(/\s+/g, "-")
    },
    [],
  )

  const getDistinctProductCount = useCallback((products: Product[]) => {
    const uniqueNames = new Set(products.map((p) => p.name.toLowerCase()))
    return uniqueNames.size
  }, [])

  const searchProducts = useCallback(
    (query: string): Product[] => {
      if (!query.trim()) return []

      const searchTerm = query.toLowerCase()
      return allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.location.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm) ||
          product.categoryType.toLowerCase().includes(searchTerm) ||
          product.categorySubType.toLowerCase().includes(searchTerm),
      )
    },
    [allProducts],
  )

  const isProductFavorite = useCallback(
    (productName: string) => {
      return favorites.some((fav) => normalizeSegment(fav.name) === normalizeSegment(productName))
    },
    [favorites, normalizeSegment],
  )

  const getCookie = useCallback(
    (name: string): string | null => {
      if (!isClient) return null
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      return parts.length === 2 ? parts.pop()?.split(";").shift() || null : null
    },
    [isClient],
  )

  const getUniqueProducts = useCallback((products: Product[]) => {
    const uniqueMap = new Map<string, Product>()
    products.forEach((product) => {
      const key = `${product.name.toLowerCase()}-${product.location.toLowerCase()}`
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, product)
      }
    })
    return Array.from(uniqueMap.values())
  }, [])

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch user status and favorites
  useEffect(() => {
    if (!isClient) return

    const checkUserStatus = async () => {
      try {
        const token = getCookie("token")
        if (!token) return

        const response = await fetch("/api/v1/auth/verifyToken", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          const data: TokenResponse = await response.json()
          setIsUserLoggedIn(true)
          setUserEmail(data.email)

          if (data.userId) {
            const favResponse = await fetch(`/api/v1/favourites/matched/${data.userId}`, {
              credentials: "include",
            })
            if (favResponse.ok) {
              const favData: Favorite[] = await favResponse.json()
              setFavorites(favData)
            }
          }
        }
      } catch (error) {
        console.error("Error checking user status:", error)
      }
    }

    checkUserStatus()
  }, [isClient, getCookie])

  // Fetch categories (only once on mount)
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/v1/categories/navbardata", { credentials: "include" })
        if (!response.ok) throw new Error("Failed to fetch categories")

        const data = await response.json()
        const dataArray = Array.isArray(data) ? data : [data]

        // Transform API response to match Category structure
        const transformedCategories: Category[] = []
        const categoryMap = new Map<string, Category>()
        const allProductsList: Product[] = []

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
                id: categoryMap.size + 1,
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
                id: sub.id || category.subCategory.length + 1,
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
            allProductsList.push(...transformedProducts)
          })
        })

        // Filter out categories with empty subcategories and add distinct product counts
        const filteredCategories = transformedCategories
          .map((cat) => ({
            ...cat,
            subCategory: cat.subCategory
              .filter((sub) => sub.product.length > 0)
              .map((sub) => ({
                ...sub,
                distinctProductCount: getDistinctProductCount(sub.product),
              })),
          }))
          .filter((cat) => cat.subCategory.length > 0)

        setCategories(filteredCategories)
        setAllProducts(allProductsList)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Failed to load categories. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [getDistinctProductCount])

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(
    async (product: Product) => {
      if (!isUserLoggedIn || !userEmail) {
        toast.error("Please log in to manage favorites")
        return
      }

      try {
        const token = getCookie("token")
        if (!token) throw new Error("No token found")

        const decodedToken = JSON.parse(atob(token.split(".")[1])) as TokenResponse
        const userId = decodedToken.userId
        const isFavorite = isProductFavorite(product.name)

        const response = await fetch("/api/v1/favourites/save", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            productName: product.name,
            userId,
          }),
        })

        if (!response.ok) throw new Error(`Failed to ${isFavorite ? "remove" : "add"} favorite`)

        const favResponse = await fetch(`/api/v1/favourites/matched/${userId}`, {
          credentials: "include",
        })
        if (!favResponse.ok) throw new Error("Failed to fetch updated favorites")

        const updatedFavorites: Favorite[] = await favResponse.json()
        setFavorites(updatedFavorites)
        toast.success(`${product.name} ${isFavorite ? "removed from" : "added to"} favorites`)
      } catch (error) {
        console.error("Error toggling favorite:", error)
        toast.error(`Failed to ${isProductFavorite(product.name) ? "remove" : "add"} ${product.name} to favorites`)
      }
    },
    [isUserLoggedIn, userEmail, isProductFavorite, getCookie],
  )

  // Navigation handlers
  const handleSubCategoryClick = useCallback(
    async (subCategory: SubCategory, categoryName: string) => {
      setIsLoading(true)
      try {
        // Use the generateSEOFriendlyURL format for API calls
        const seoCategory = categoryName.toLowerCase().replace(/\s+/g, "-")
        const seoSubCategory = subCategory.name.toLowerCase().replace(/\s+/g, "-")
        const apiUrl = `/api/v1/products/filter/${seoCategory}/${seoSubCategory}`

        const response = await fetch(apiUrl, { credentials: "include" })
        if (!response.ok) throw new Error("Failed to fetch subcategory products")

        const data: Product[] = await response.json()
        const updatedSubCategory: SubCategory = {
          ...subCategory,
          product: data.map((prod) => ({
            _id: prod._id,
            name: prod.name || prod.name,
            location: prod.location || "Unknown",
            description: prod.description || "No description available",
            brand: prod.brand || "No brand specified",
            categoryType: categoryName,
            categorySubType: subCategory.name,
          })),
          distinctProductCount: getDistinctProductCount(data),
        }

        // Update categories with fresh data
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.category === categoryName
              ? {
                  ...cat,
                  subCategory: cat.subCategory.map((sub) => (sub._id === subCategory._id ? updatedSubCategory : sub)),
                }
              : cat,
          ),
        )

        // Find the category and set active states
        const category = categories.find((cat) => cat.category === categoryName)
        if (category) {
          setActiveCategory(category._id)
        }

        setSelectedSubCategory(updatedSubCategory)
        setActiveSubCategory(subCategory._id)
        setSelectedProductName("")
        setSelectedLocation("")
        setViewMode("subcategory")
        setProductSearch("")
        setGlobalSearch("")

        // Close mobile sidebar after selection
        setIsSidebarOpen(false)

        onNavigate?.(categoryName, subCategory.name)
      } catch (error) {
        console.error("Error fetching subcategory products:", error)
        toast.error("Failed to load subcategory products. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [onNavigate, getDistinctProductCount, categories],
  )

  const handleProductClick = useCallback(
    async (product: Product, categoryName: string) => {
      setIsLoading(true)
      try {
        // Use the generateSEOFriendlyURL format for API calls
        const seoCategory = categoryName.toLowerCase().replace(/\s+/g, "-")
        const seoSubCategory = (selectedSubCategory?.name || "").toLowerCase().replace(/\s+/g, "-")
        const seoProduct = product.name.toLowerCase().replace(/\s+/g, "-")
        const apiUrl = `/api/v1/products/filter/${seoCategory}/${seoSubCategory}/${seoProduct}`

        const response = await fetch(apiUrl, { credentials: "include" })
        if (!response.ok) throw new Error("Failed to fetch products")

        const data: Product[] = await response.json()

        if (selectedSubCategory) {
          const updatedSubCategory: SubCategory = {
            ...selectedSubCategory,
            product: data.map((prod) => ({
              _id: prod._id,
              name: prod.name || prod.name,
              location: prod.location || "Unknown",
              description: prod.description || "No description available",
              brand: prod.brand || "No brand specified",
              categoryType: categoryName,
              categorySubType: selectedSubCategory.name,
            })),
          }

          setSelectedSubCategory(updatedSubCategory)
        }

        setSelectedProductName(product.name)
        setSelectedLocation("")
        setViewMode("product")
        onNavigate?.(categoryName, selectedSubCategory?.name, product.name)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast.error("Failed to load products. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [onNavigate, selectedSubCategory],
  )

  const handleLocationClick = useCallback(
    async (product: Product, categoryName: string, location: string) => {
      setIsLoading(true)
      try {
        // Use the generateSEOFriendlyURL format for API calls
        const seoCategory = categoryName.toLowerCase().replace(/\s+/g, "-")
        const seoSubCategory = (selectedSubCategory?.name || "").toLowerCase().replace(/\s+/g, "-")
        const seoProduct = product.name.toLowerCase().replace(/\s+/g, "-")
        const seoLocation = location.toLowerCase().replace(/\s+/g, "-")
        const apiUrl = `/api/v1/products/filter/${seoCategory}/${seoSubCategory}/${seoProduct}/${seoLocation}`

        const response = await fetch(apiUrl, { credentials: "include" })
        if (!response.ok) throw new Error("Failed to fetch location products")

        const data: Product[] = await response.json()

        if (selectedSubCategory) {
          const updatedSubCategory: SubCategory = {
            ...selectedSubCategory,
            product: data.map((prod) => ({
              _id: prod._id,
              name: prod.name || prod.name,
              location: prod.location || "Unknown",
              description: prod.description || "No description available",
              brand: prod.brand || "No brand specified",
              categoryType: categoryName,
              categorySubType: selectedSubCategory.name,
            })),
          }

          setSelectedSubCategory(updatedSubCategory)
        }

        setSelectedProductName(product.name)
        setSelectedLocation(location)
        setViewMode("product")
        onNavigate?.(categoryName, selectedSubCategory?.name, product.name, location)
      } catch (error) {
        console.error("Error fetching location products:", error)
        toast.error("Failed to load location products. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [onNavigate, selectedSubCategory],
  )

  const handleBackToCategories = useCallback(() => {
    setViewMode("categories")
    setSelectedSubCategory(null)
    setSelectedProductName("")
    setSelectedLocation("")
    setActiveCategory("")
    setActiveSubCategory("")
    setProductSearch("")
    setGlobalSearch("")
    onNavigate?.()
  }, [onNavigate])

  const handleBackToSubcategory = useCallback(() => {
    if (selectedSubCategory) {
      const categoryName =
        categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category || ""
      setViewMode("subcategory")
      setSelectedProductName("")
      setSelectedLocation("")
      setProductSearch("")
      onNavigate?.(categoryName, selectedSubCategory.name)
    }
  }, [selectedSubCategory, categories, onNavigate])

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      const category = categories.find((cat) => cat._id === categoryId)
      if (category) {
        setActiveCategory(categoryId)
        setActiveSubCategory("")
        setViewMode("subcategory")
        setSelectedSubCategory(null)
        setSelectedProductName("")
        setSelectedLocation("")
        setProductSearch("")
        setGlobalSearch("")
        onNavigate?.(category.category)
      } else {
        setActiveCategory("")
        setActiveSubCategory("")
        setViewMode("categories")
        setSelectedSubCategory(null)
        setSelectedProductName("")
        setSelectedLocation("")
        setProductSearch("")
        setGlobalSearch("")
        onNavigate?.()
      }
    },
    [categories, onNavigate],
  )

  // Initialize from URL parameters
  const initializeFromParams = useCallback(
    async (category?: string, subcategory?: string, product?: string, location?: string) => {
      if (categories.length === 0) return

      // Reset initialization ref when URL changes
      initializedRef.current = false

      let initialCategory: Category | undefined
      let initialSubCategory: SubCategory | undefined
      let initialActiveCategoryId = ""
      let initialActiveSubCategoryId = ""

      if (category) {
        const normalizedCategory = normalizeSegment(category)
        initialCategory = categories.find((cat) => normalizeSegment(cat.category) === normalizedCategory)
        if (initialCategory) initialActiveCategoryId = initialCategory._id
      }

      if (initialCategory && subcategory) {
        const normalizedSubcategory = normalizeSegment(subcategory)
        initialSubCategory = initialCategory.subCategory.find(
          (sub) => normalizeSegment(sub.name) === normalizedSubcategory,
        )
        if (initialSubCategory) initialActiveSubCategoryId = initialSubCategory._id
      }

      // Always update state regardless of initialization status
      setActiveCategory(initialActiveCategoryId)
      setActiveSubCategory(initialActiveSubCategoryId)
      setSelectedSubCategory(initialSubCategory || null)
      setSelectedProductName(product ? normalizeSegment(product) : "")
      setSelectedLocation(location ? normalizeSegment(location) : "")
      setProductSearch("")
      setGlobalSearch("")

      if (!category) {
        setViewMode("categories")
      } else if (category && !subcategory) {
        setViewMode("subcategory")
      } else if (category && subcategory && !product) {
        setViewMode("subcategory")
      } else if (category && subcategory && product) {
        setViewMode("product")
      }

      // Fetch subcategory products if needed
      if (initialCategory && initialSubCategory && !initializedRef.current) {
        initializedRef.current = true
        await handleSubCategoryClick(initialSubCategory, initialCategory.category)
      }
    },
    [categories, normalizeSegment, handleSubCategoryClick],
  )

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      // Data
      categories,
      favorites,
      allProducts,

      // UI State
      isLoading,
      categorySearch,
      productSearch,
      globalSearch,
      selectedSubCategory,
      selectedProductName,
      selectedLocation,
      activeCategory,
      activeSubCategory,
      viewMode,
      isSidebarOpen,

      // User State
      isUserLoggedIn,
      userEmail,

      // Actions
      setCategorySearch,
      setProductSearch,
      setGlobalSearch,
      setIsSidebarOpen,
      setActiveCategory,
      setActiveSubCategory,
      handleCategoryClick,
      handleSubCategoryClick,
      handleProductClick,
      handleLocationClick,
      handleFavoriteToggle,
      handleBackToCategories,
      handleBackToSubcategory,

      // Utilities
      isProductFavorite,
      generateSEOFriendlyURL,
      normalizeSegment,
      getDistinctProductCount,
      searchProducts,
      getUniqueProducts,

      // Navigation
      initializeFromParams,
      onNavigate,
    }),
    [
      categories,
      favorites,
      allProducts,
      isLoading,
      categorySearch,
      productSearch,
      globalSearch,
      selectedSubCategory,
      selectedProductName,
      selectedLocation,
      activeCategory,
      activeSubCategory,
      viewMode,
      isSidebarOpen,
      isUserLoggedIn,
      userEmail,
      setCategorySearch,
      setProductSearch,
      setGlobalSearch,
      setIsSidebarOpen,
      setActiveCategory,
      setActiveSubCategory,
      handleCategoryClick,
      handleSubCategoryClick,
      handleProductClick,
      handleLocationClick,
      handleFavoriteToggle,
      handleBackToCategories,
      handleBackToSubcategory,
      isProductFavorite,
      generateSEOFriendlyURL,
      normalizeSegment,
      getDistinctProductCount,
      searchProducts,
      getUniqueProducts,
      initializeFromParams,
      onNavigate,
    ],
  )

  return <ProductContext.Provider value={contextValue}>{children}</ProductContext.Provider>
}
