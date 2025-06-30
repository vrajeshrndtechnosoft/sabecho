import type { Metadata } from "next"
import ProductDisplay from "@/components/product-display"

// Next.js 15 props type — params is now a Promise!
type Props = {
  params: Promise<{
    slug?: string[]
  }>
}

// SEO metadata generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await the params Promise
  const resolvedParams = await params
  const slug = resolvedParams.slug ?? []
  const pagePath = `/products/${slug.join("/")}`

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/v1/metadata?page=${pagePath}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
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

// Product details page component
export default async function ProductSlugPage({ params }: Props) {
  // Await the params Promise
  const resolvedParams = await params
  const slug = resolvedParams.slug ?? []

  const category = slug[0]
  const subcategory = slug[1]
  const product = slug[2]
  const location = slug[3]

  // Add key prop to force re-render when params change
  return (
    <ProductDisplay
      key={slug.join("/")}
      category={category}
      subcategory={subcategory}
      product={product}
      location={location}
    />
  )
}
