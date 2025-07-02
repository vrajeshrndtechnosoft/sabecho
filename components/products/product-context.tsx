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

type ViewMode = "categories" | "subcategory" | "product" | "location"

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
  initializeFromParams: (category?: string, subcategory?: string, product?: string, location?: string) => Promise<void>
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
  const [viewMode, setViewMode] = useState<ViewMode>("categories")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")

  // Refs to prevent infinite loops
  const initializedRef = useRef(false)
  const lastParamsRef = useRef<string>("")

  // Utility functions
  const normalizeSegment = useCallback((segment = "") => {
    return segment.toLowerCase().replace(/-/g, " ")
  }, [])

  // SEO-friendly URL generator
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

  // Fetch specific product data from API
  const fetchProductData = useCallback(
    async (category: string, subcategory?: string, product?: string, location?: string) => {
      try {
        setIsLoading(true)

        // Build API URL based on available parameters
        const seoCategory = category.toLowerCase().replace(/\s+/g, "-")
        let apiUrl = `/api/v1/products/filter/${seoCategory}`

        if (subcategory) {
          const seoSubCategory = subcategory.toLowerCase().replace(/\s+/g, "-")
          apiUrl += `/${seoSubCategory}`

          if (product) {
            const seoProduct = product.toLowerCase().replace(/\s+/g, "-")
            apiUrl += `/${seoProduct}`

            if (location) {
              const seoLocation = location.toLowerCase().replace(/\s+/g, "-")
              apiUrl += `/${seoLocation}`
            }
          }
        }

        const response = await fetch(apiUrl, { credentials: "include" })
        if (!response.ok) throw new Error(`Failed to fetch data from ${apiUrl}`)

        const data: Product[] = await response.json()

        // Transform the data to match our Product interface
        const transformedProducts = data.map((prod: any) => ({
          _id: prod._id,
          name: prod.name || prod.p_name,
          location: prod.location || "Unknown",
          description: prod.description || "No description available",
          brand: prod.brand || "No brand specified",
          categoryType: category,
          categorySubType: subcategory || "",
        }))

        // Create a subcategory object with the fetched products
        const fetchedSubCategory: SubCategory = {
          _id: `fetched_${subcategory}_${Date.now()}`,
          name: subcategory || "",
          product: transformedProducts,
          id: 1,
          distinctProductCount: getDistinctProductCount(transformedProducts),
        }

        return fetchedSubCategory
      } catch (error) {
        console.error("Error fetching product data:", error)
        toast.error("Failed to load product data. Please try again.")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [getDistinctProductCount],
  )

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
      const fetchedData = await fetchProductData(categoryName, subCategory.name)
      if (fetchedData) {
        setSelectedSubCategory(fetchedData)
        setSelectedProductName("")
        setSelectedLocation("")
        setViewMode("subcategory")
        setProductSearch("")
        setGlobalSearch("")
        setIsSidebarOpen(false)
        onNavigate?.(categoryName, subCategory.name)
      }
    },
    [fetchProductData, onNavigate],
  )

  const handleProductClick = useCallback(
    async (product: Product, categoryName: string) => {
      const category = categories.find((cat) => cat.category === categoryName)
      const subCategory = category?.subCategory.find((sub) => sub.product.some((p) => p._id === product._id))

      if (!subCategory) {
        toast.error("Subcategory not found for this product")
        return
      }

      const fetchedData = await fetchProductData(categoryName, subCategory.name, product.name)
      if (fetchedData) {
        setSelectedSubCategory(fetchedData)
        setSelectedProductName(product.name)
        setSelectedLocation("")
        setViewMode("product")
        onNavigate?.(categoryName, subCategory.name, product.name)
      }
    },
    [fetchProductData, onNavigate, categories],
  )

  const handleLocationClick = useCallback(
    async (product: Product, categoryName: string, location: string) => {
      const category = categories.find((cat) => cat.category === categoryName)
      const subCategory = category?.subCategory.find((sub) => sub.product.some((p) => p._id === product._id))

      if (!subCategory) {
        toast.error("Subcategory not found for this product")
        return
      }

      const fetchedData = await fetchProductData(categoryName, subCategory.name, product.name, location)
      if (fetchedData) {
        setSelectedSubCategory(fetchedData)
        setSelectedProductName(product.name)
        setSelectedLocation(location)
        setViewMode("location")
        onNavigate?.(categoryName, subCategory.name, product.name, location)
      }
    },
    [fetchProductData, onNavigate, categories],
  )

  const handleBackToCategories = useCallback(() => {
    setViewMode("categories")
    setSelectedSubCategory(null)
    setSelectedProductName("")
    setSelectedLocation("")
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
        setViewMode("subcategory")
        setSelectedSubCategory(null)
        setSelectedProductName("")
        setSelectedLocation("")
        setProductSearch("")
        setGlobalSearch("")
        onNavigate?.(category.category)
      } else {
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

  // Initialize from URL parameters - Now properly fetches data from API
  const initializeFromParams = useCallback(
    async (category?: string, subcategory?: string, product?: string, location?: string) => {
      if (categories.length === 0) return

      // Create a unique key for current params to prevent unnecessary re-initialization
      const currentParamsKey = `${category || ""}-${subcategory || ""}-${product || ""}-${location || ""}`

      // If params haven't changed, don't re-initialize
      if (lastParamsRef.current === currentParamsKey && initializedRef.current) {
        return
      }

      lastParamsRef.current = currentParamsKey
      initializedRef.current = true

      // If we have URL parameters, fetch the specific data from API
      if (category) {
        const normalizedCategory = normalizeSegment(category)
        const foundCategory = categories.find((cat) => normalizeSegment(cat.category) === normalizedCategory)

        if (!foundCategory) {
          console.error("Category not found:", category)
          setViewMode("categories")
          return
        }

        // If we have subcategory, fetch data from API
        if (subcategory) {
          const fetchedData = await fetchProductData(foundCategory.category, subcategory, product, location)

          if (fetchedData) {
            setSelectedSubCategory(fetchedData)
            setSelectedProductName(product ? normalizeSegment(product) : "")
            setSelectedLocation(location ? normalizeSegment(location) : "")

            // Determine view mode based on parameters
            if (location) {
              setViewMode("location")
            } else if (product) {
              setViewMode("product")
            } else {
              setViewMode("subcategory")
            }
          } else {
            // Fallback to categories view if fetch fails
            setViewMode("categories")
          }
        } else {
          // Just category, show subcategory view without specific data
          setViewMode("subcategory")
          setSelectedSubCategory(null)
          setSelectedProductName("")
          setSelectedLocation("")
        }
      } else {
        // No category, show categories view
        setViewMode("categories")
        setSelectedSubCategory(null)
        setSelectedProductName("")
        setSelectedLocation("")
      }

      setProductSearch("")
      setGlobalSearch("")
    },
    [categories, normalizeSegment, fetchProductData],
  )

  // Reset initialization when categories change
  useEffect(() => {
    if (categories.length > 0) {
      initializedRef.current = false
      lastParamsRef.current = ""
    }
  }, [categories])

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
      viewMode,
      isSidebarOpen,
      isUserLoggedIn,
      userEmail,
      setCategorySearch,
      setProductSearch,
      setGlobalSearch,
      setIsSidebarOpen,
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
