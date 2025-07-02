import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"
import Image from "next/image"
import type { Category } from "@/components/types"
import { CategoryClickClient } from "./category-click-client"

interface CategoriesSectionProps {
  categories: Category[]
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Categories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our wide range of product categories to find exactly what your business needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card
              key={category._id}
              className="hover:shadow-lg transition-all duration-300 group hover:scale-105 cursor-pointer"
            >
              <CardHeader>
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {category.image.url ? (
                    <Image
                      src={`/api/v1/explore-categories/image/${category.image.url}`}
                      alt={category.image.altText}
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      width={400}
                      height={192}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Globe className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                </div>
                <Badge className="mb-2">{category.title}</Badge>
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <CardDescription>{category.productNames.join(", ")}</CardDescription>
              </CardHeader>

              <CardContent>
                {/* ✅ Client-only button inside Card */}
                <CategoryClickClient category={category} />
              </CardContent>
            </Card>
          ))}

        </div>
      </div>
    </div>
  )
}
