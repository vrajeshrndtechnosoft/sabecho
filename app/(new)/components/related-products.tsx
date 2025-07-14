import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"

interface RelatedProduct {
  id: string
  name: string
  description: string
  price: number
  image: string
}

interface RelatedProductsProps {
  products: RelatedProduct[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
        RELATED PRODUCTS
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Button
                  className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  size="sm"
                >
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
            <CardFooter className="px-4 pb-4 pt-0">
              <div className="w-full">
                <p className="text-orange-600 font-semibold text-sm mb-3">
                  Starting from ₹ {product.price.toFixed(2)} / Piece.
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
