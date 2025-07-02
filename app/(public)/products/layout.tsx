import type React from "react"
import { Suspense } from "react"
import ProductLayoutServer from "@/components/products/product-layout-server"

interface ProductsLayoutProps {
  children: React.ReactNode
}

export default async function ProductsLayout({ children }: ProductsLayoutProps) {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductLayoutServer>{children}</ProductLayoutServer>
    </Suspense>
  )
}

function ProductsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}
