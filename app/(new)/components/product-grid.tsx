"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  capacity: number
  category: string
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const handleBuyNow = (productId: number) => {
    // Handle buy now action
    console.log(`Buy now clicked for product ${productId}`)
  }

  return (
    <div className="space-y-4">
      {/* Mobile Results Header */}
      <div className="md:hidden flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">{products.length} Products Found</span>
        <Button variant="ghost" size="sm" className="text-orange-600">
          Sort by: Price
        </Button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-3 md:p-4">
              <div className="relative mb-3 md:mb-4">
                <Button
                  onClick={() => handleBuyNow(product.id)}
                  className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 md:px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  size="sm"
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Buy Now
                </Button>
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-gray-600 text-xs mb-3">{product.description}</p>
            </CardContent>
            <CardFooter className="px-3 md:px-4 pb-3 md:pb-4 pt-0">
              <div className="w-full">
                <p className="text-orange-600 font-semibold text-sm mb-3">
                  Starting from ₹ {product.price.toFixed(2)} / Piece.
                </p>
                <Button
                  onClick={() => handleBuyNow(product.id)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Mobile Load More Button */}
      <div className="md:hidden flex justify-center mt-6">
        <Button variant="outline" className="px-8 bg-transparent">
          Load More Products
        </Button>
      </div>
    </div>
  )
}
