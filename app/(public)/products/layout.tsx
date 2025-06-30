import type React from "react"
import ProductLayout from "@/components/product-layout"

interface ProductsLayoutProps {
  children: React.ReactNode
}

const ProductsLayout: React.FC<ProductsLayoutProps> = ({ children }) => {
  return <ProductLayout>{children}</ProductLayout>
}

export default ProductsLayout
