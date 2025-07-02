/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchCategories, generateSEOFriendlyURL, type Category } from "@/lib/product-server-utils"
import CategorySearchClient from "./category-search-client"
import CategoryToggleClient from "./category-toggle-client" // Import CategoryToggleClient

interface CategoryListServerProps {
  searchQuery?: string
  expandedCategories?: string[]
}

export default async function CategoryListServer({
  searchQuery = "",
  expandedCategories = [],
}: CategoryListServerProps) {
  const categories = await fetchCategories()

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) => cat.category.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-0">
      <CardContent className="p-3 md:p-4 lg:p-5">
        <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6">
          <h2 className="text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900">Product Categories</h2>
        </div>

        <CategorySearchClient />

        <div className="space-y-1 md:space-y-2 lg:space-y-3">
          {filteredCategories.map((cat) => (
            <CategoryItem key={cat._id} category={cat} isExpanded={expandedCategories.includes(cat._id)} />
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-4 md:py-6 lg:py-8">
            <div className="text-gray-400 mb-2">
              <Search className="mx-auto h-6 w-6 md:h-8 md:w-8" />
            </div>
            <p className="text-xs md:text-sm text-gray-500">No categories found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CategoryItem({ category, isExpanded }: { category: Category; isExpanded: boolean }) {
  return (
    <div className="border-b border-gray-200">
      {/* Category Header */}
      <div className="flex items-center justify-between py-1.5 md:py-2 lg:py-3">
        <Link
          href={generateSEOFriendlyURL(category.category)}
          className="flex-1 text-left text-gray-900 font-semibold hover:text-blue-600 text-xs md:text-sm lg:text-base transition-colors"
        >
          {category.category}
        </Link>
        <CategoryToggleClient categoryId={category._id} isExpanded={isExpanded} />
      </div>

      {/* Category Content */}
      {isExpanded && (
        <div className="pb-2 pl-1 md:pl-2 lg:pl-4">
          {category.subCategory.map((sub) => (
            <SubCategoryItem key={sub._id} subCategory={sub} categoryName={category.category} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubCategoryItem({ subCategory, categoryName }: { subCategory: any; categoryName: string }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between py-1 md:py-1.5">
        <Link
          href={generateSEOFriendlyURL(categoryName, subCategory.name)}
          className="flex-1 text-left text-gray-700 hover:text-blue-600 text-xs md:text-sm transition-colors"
        >
          <span className="truncate pr-1">{subCategory.name}</span>
          <span className="text-xs text-gray-400 ml-1">
            ({subCategory.distinctProductCount || subCategory.product.length})
          </span>
        </Link>
      </div>
    </div>
  )
}
