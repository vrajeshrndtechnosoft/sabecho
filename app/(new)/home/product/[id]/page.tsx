import { Suspense } from "react"
import { ProductDetailServer } from "../../../components/product-detail-server"
import { ProductDetailSkeleton } from "../../../components/product-detail-skeleton"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailServer productId={id} />
      </Suspense>
    </div>
  )
}
