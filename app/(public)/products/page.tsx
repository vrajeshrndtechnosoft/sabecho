import { Suspense } from "react"
import ProductDisplayServer from "@/components/products/product-display-server"

type Props = {
  searchParams: Promise<{
    search?: string
    expanded?: string
  }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const searchQuery = resolvedSearchParams.search

  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductDisplayServer searchQuery={searchQuery} />
    </Suspense>
  )
}

function ProductsPageLoading() {
  return (
    <div className="p-3 md:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
