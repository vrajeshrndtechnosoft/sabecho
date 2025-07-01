import type React from "react"
import { Suspense } from "react"
import ProductLayout from "@/components/product-layout"

interface ProductsLayoutProps {
  children: React.ReactNode
}

// Loading component for suspense
const ProductsLoading = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

const ProductsLayout: React.FC<ProductsLayoutProps> = ({ children }) => {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductLayout>{children}</ProductLayout>
    </Suspense>
  )
}

export default ProductsLayout
