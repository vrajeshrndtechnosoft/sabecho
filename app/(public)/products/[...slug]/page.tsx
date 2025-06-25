// app/products/[...slug]/page.tsx

import type { Metadata } from "next";
import ProductDisplay from "@/app/(public)/products/page";

// ✅ Next.js 15 props type — params is now a Promise!
type Props = {
  params: Promise<{
    slug?: string[];
  }>;
};

// ✅ SEO metadata generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await the params Promise
  const resolvedParams = await params;
  const slug = resolvedParams.slug ?? [];
  const pagePath = `/products/${slug.join("/")}`;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/metadata?page=${pagePath}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch metadata");

    const [meta] = await res.json();

    return {
      title: {
        default: meta?.title ?? "Product | Sabecho.com",
        template: "%s | Sabecho.com",
      },
      description: meta?.description,
      keywords: meta?.keywords,
      alternates: {
        canonical: meta?.canonicalUrl ?? `${process.env.BASE_URL}${pagePath}`,
      },
    };
  } catch (error) {
    console.error("❌ Metadata fetch error:", error);
    return {
      title: "Product | Sabecho.com",
      description: "Find verified B2B products and suppliers on Sabecho.",
    };
  }
}

// ✅ Actual page component
export default async function ProductPage({ params }: Props) {
  // Await the params Promise
  const resolvedParams = await params;
  const slug = resolvedParams.slug ?? [];

  const category = slug[0];
  const subcategory = slug[1];
  const product = slug[2];
  const location = slug[3];

  return (
    <ProductDisplay
      category={category}
      subcategory={subcategory}
      product={product}
      location={location}
    />
  );
}