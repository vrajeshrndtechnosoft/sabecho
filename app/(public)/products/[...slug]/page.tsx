import type { Metadata } from "next"
import { Suspense } from "react"
import ProductDisplayServer from "@/components/products/product-display-server"

type Props = {
  params: Promise<{
    slug?: string[]
  }>
  searchParams: Promise<{
    search?: string
    expanded?: string
  }>
}

// Loading component for critical content
const ProductDisplayLoading = () => (
  <div className="p-3 md:p-4 lg:p-6 xl:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
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

// SEO metadata generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug ?? []
  const pagePath = `/products/${slug.join("/")}`

  try {
    const baseUrl = process.env.BASE_URL
    const res = await fetch(`${baseUrl}/api/v1/metadata?page=${pagePath}`, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })

    if (!res.ok) throw new Error("Failed to fetch metadata")

    const meta = await res.json()
    const metaData = Array.isArray(meta) ? meta[0] : meta

    return {
      title: {
        default: metaData?.title ?? "Product | Sabecho.com",
        template: "%s | Sabecho.com",
      },
      description: metaData?.description ?? "Find verified B2B products and suppliers on Sabecho.",
      keywords: metaData?.keywords,
      alternates: {
        canonical: metaData?.canonicalUrl ?? `${baseUrl}${pagePath}`,
      },
    }
  } catch (error) {
    console.error("❌ Metadata fetch error:", error)
    return {
      title: "Product | Sabecho.com",
      description: "Find verified B2B products and suppliers on Sabecho.",
    }
  }
}

export default async function ProductSlugPage({ params, searchParams }: Props) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])

  const slug = resolvedParams.slug ?? []
  const searchQuery = resolvedSearchParams.search

  const category = slug[0]
  const subcategory = slug[1]
  const product = slug[2]
  const location = slug[3]

  return (
    <Suspense fallback={<ProductDisplayLoading />}>
      <ProductDisplayServer
        category={category}
        subcategory={subcategory}
        product={product}
        location={location}
        searchQuery={searchQuery}
      />
    </Suspense>
  )
}
