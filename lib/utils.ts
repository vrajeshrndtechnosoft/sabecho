import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

interface Product {
  _id: string
  name: string
  location: string
  description: string
  brand: string
  categoryType: string
  categorySubType: string
}

export const getUniqueProducts = (products: Product[]): Product[] => {
  const uniqueMap = new Map<string, Product>()
  products.forEach((product) => {
    const key = `${product.name.toLowerCase()}-${product.location.toLowerCase()}`
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, product)
    }
  })
  return Array.from(uniqueMap.values())
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
