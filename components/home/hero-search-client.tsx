"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SearchCombobox from "@/components/products/product-search"
import type { Product } from "@/components/types"

export function HeroSearchClient() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const router = useRouter()

  const handleProductClick = (product: Product) => {
    const parts = [product.categoryType, product.categorySubType, product.name, product.location].filter(Boolean)
    const url = `/products/${parts.join("/")}`.toLowerCase().replace(/\s+/g, "-")
    router.push(url)
  }

  const handleProductChange = (product: Product | null) => {
    setSelectedProduct(product)
    if (product) {
      handleProductClick(product)
    }
  }

  return (
    <>
      <SearchCombobox value={selectedProduct} onChange={handleProductChange} className="w-full max-w-2xl" />
  </>
  )
}
