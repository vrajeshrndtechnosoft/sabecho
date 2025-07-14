import { Suspense } from "react"
import { ProductPageServer } from "../../components/product-page-server"
import { ProductPageSkeleton } from "../../components/product-page-skeleton"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductPageServer />
      </Suspense>
    </div>
  )
}
