import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import Image from "next/image";
import type { Category } from "@/components/types";
import { CategoryClickClient } from "./categories-click-client";

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <div
      className="bg-gradient-to-b from-white to-gray-100 py-12"
      style={{
        backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23F97316' fill-opacity='0.05' d='M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,74.7C960,64,1056,32,1152,32C1248,32,1344,64,1392,80L1440,96V320H1392H1344H1248H1152H1056H960H864H768H672H576H480H384H288H192H96H48H0V0Z'%3E%3C/path%3E%3C/svg%3E')",
        backgroundRepeat: "repeat-x",
        backgroundSize: "100% 100%",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-wide">
            Explore Categories
          </h2>
          <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
            Browse our product categories to find what you need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category._id}
              className="bg-white border-orange-100 hover:shadow-md transition-all duration-300 group hover:-translate-y-1 cursor-pointer rounded-lg"
            >
              <CardHeader>
                <div className="w-full h-32 bg-orange-50 rounded-t-lg overflow-hidden">
                  {category.image.url ? (
                    <Image
                      src={`/api/v1/explore-categories/image/${category.image.url}`}
                      alt={category.image.altText}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      width={300}
                      height={128}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      <Globe className="w-10 h-10 text-orange-500" />
                    </div>
                  )}
                </div>
                <Badge className="bg-orange-300 text-white mb-2 mt-2">{category.title}</Badge>
                <CardTitle className="text-base md:text-lg font-semibold text-gray-900">
                  {category.title}
                </CardTitle>
                <CardDescription className="text-gray-700 text-sm">
                  {category.productNames.join(", ")}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4">
                <CategoryClickClient category={category} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}