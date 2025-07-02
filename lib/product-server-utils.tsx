/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers"

export interface Product {
  _id: string
  name: string
  location: string
  description: string
  brand: string
  categoryType: string
  categorySubType: string
  p_name: string
}

export interface SubCategory {
  _id: string
  name: string
  product: Product[]
  id: number
  distinctProductCount?: number
}

export interface Category {
  _id: string
  category: string
  subCategory: SubCategory[]
  id: number
}

export interface Favorite {
  _id: string
  name: string
  priority: number
  createdAt: string
}

// Server-side data fetching functions with SMART CACHING
export async function fetchCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.BASE_URL
    const response = await fetch(`${baseUrl}/api/v1/categories/navbardata`, {
      next: {
        revalidate: 300, // Cache for 5 minutes
        tags: ["categories"], // Tag for selective revalidation
      },
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) throw new Error("Failed to fetch categories")

    const data = await response.json()
    const dataArray = Array.isArray(data) ? data : [data]

    // Transform API response to match Category structure
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
          p_name: prod.p_name,
        }))

        subCategory.product.push(...transformedProducts)
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

    return filteredCategories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function fetchProductData(
  category: string,
  subcategory?: string,
  product?: string,
  location?: string,
): Promise<Product[]> {
  try {
    const baseUrl = process.env.BASE_URL
    const seoCategory = category.toLowerCase().replace(/\s+/g, "-")
    let apiUrl = `${baseUrl}/api/v1/products/filter/${seoCategory}`

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

    // Cache products for 2 minutes with tags for selective revalidation
    const cacheKey = `products-${category}-${subcategory || "all"}-${product || "all"}-${location || "all"}`
    const response = await fetch(apiUrl, {
      next: {
        revalidate: 120, // Cache for 2 minutes
        tags: ["products", cacheKey, `category-${category}`],
      },
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) throw new Error(`Failed to fetch data from ${apiUrl}`)

    const data: any[] = await response.json()

    return data.map((prod: any) => ({
      _id: prod._id,
      name: prod.name || prod.p_name,
      location: prod.location || "Unknown",
      description: prod.description || "No description available",
      brand: prod.brand || "No brand specified",
      categoryType: category,
      categorySubType: subcategory || "",
      p_name: prod.name || prod.p_name,
    }))
  } catch (error) {
    console.error("Error fetching product data:", error)
    return []
  }
}

export async function fetchUserFavorites(): Promise<Favorite[]> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) return []

    const decodedToken = JSON.parse(atob(token.split(".")[1]))
    const userId = decodedToken.userId

    if (!userId) return []

    const baseUrl = process.env.BASE_URL
    const response = await fetch(`${baseUrl}/api/v1/favourites/matched/${userId}`, {
      next: {
        revalidate: 60, // Cache favorites for 1 minute
        tags: ["favorites", `user-${userId}`],
      },
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) return []

    return await response.json()
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return []
  }
}

// Utility functions remain the same
export function getDistinctProductCount(products: Product[]): number {
  const uniqueNames = new Set(products.map((p) => p.name.toLowerCase()))
  return uniqueNames.size
}

export function getUniqueProducts(products: Product[]): Product[] {
  const uniqueMap = new Map<string, Product>()
  products.forEach((product) => {
    const key = `${product.name.toLowerCase()}-${product.location.toLowerCase()}`
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, product)
    }
  })
  return Array.from(uniqueMap.values())
}

export function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function normalizeSegment(segment = ""): string {
  return segment.toLowerCase().replace(/-/g, " ")
}

export function generateSEOFriendlyURL(
  category?: string,
  subCategory?: string,
  product?: string,
  location?: string,
): string {
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
}

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return []

  const searchTerm = query.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.location.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.categoryType.toLowerCase().includes(searchTerm) ||
      product.categorySubType.toLowerCase().includes(searchTerm),
  )
}
