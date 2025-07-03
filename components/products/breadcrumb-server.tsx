import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbServerProps {
  category?: string
  subcategory?: string
  product?: string
  location?: string
}

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function generateSEOFriendlyURL(category?: string, subCategory?: string, product?: string, location?: string) {
  const cleanPart = (part: string | undefined): string => {
    if (!part) return "";
    return part
      .toLowerCase()
      .replace(/&/g, "and") // Replace ampersands with "and"
      .replace(/[^a-z0-9\s-]/g, "") // Keep spaces and hyphens, remove other special characters
      .trim() // Remove leading/trailing spaces
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Remove duplicate hyphens
  };

  const parts = [category, subCategory, product, location]
    .filter(Boolean)
    .map(cleanPart)
    .filter(Boolean);
  return `/products/${parts.join("/")}`;
}

export default function BreadcrumbServer({ category, subcategory, product, location }: BreadcrumbServerProps) {
  const breadcrumbItems = []

  // Always start with Categories
  breadcrumbItems.push({
    label: "Categories",
    href: "/products",
    isLast: false,
  })

  // Add category if present
  if (category) {
    breadcrumbItems.push({
      label: formatSegment(category),
      href: generateSEOFriendlyURL(category),
      isLast: false,
    })
  }

  // Add subcategory if present
  if (subcategory) {
    breadcrumbItems.push({
      label: formatSegment(subcategory),
      href: generateSEOFriendlyURL(category, subcategory),
      isLast: false,
    })
  }

  // Add product if present
  if (product) {
    breadcrumbItems.push({
      label: formatSegment(product),
      href: generateSEOFriendlyURL(category, subcategory, product),
      isLast: false,
    })
  }

  // Add location if present
  if (location) {
    breadcrumbItems.push({
      label: formatSegment(location),
      href: generateSEOFriendlyURL(category, subcategory, product, location),
      isLast: true,
    })
  } else if (product) {
    // Mark product as last if no location
    breadcrumbItems[breadcrumbItems.length - 1].isLast = true
  } else if (subcategory) {
    // Mark subcategory as last if no product
    breadcrumbItems[breadcrumbItems.length - 1].isLast = true
  } else if (category) {
    // Mark category as last if no subcategory
    breadcrumbItems[breadcrumbItems.length - 1].isLast = true
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-gray-600 mb-6 space-x-2">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {item.isLast ? (
            <span className="text-gray-900 font-semibold">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-blue-600 font-medium transition-colors">
              {item.label}
            </Link>
          )}
          {!item.isLast && <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      ))}
    </nav>
  )
}
