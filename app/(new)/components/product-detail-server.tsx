import { ProductImageGallery } from "./product-image-gallery"
import { ProductInfo } from "./product-info"
import { ProductTabs } from "./product-tabs"
import { RelatedProducts } from "./related-products"
import { ProductBreadcrumb } from "./product-breadcrumb"

// Mock data - in a real app, this would come from a database
async function getProductDetails(productId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    id: productId,
    name: "750 ML Eco Friendly Brown Kraft Paper Salad Bowl Without Lid Plain And Customized Printing",
    price: 4.49,
    images: [
      {
        id: 1,
        src: "/kraft-paper-bowl-image.webp?height=500&width=500",
        alt: "Kraft Paper Bowl - Main View",
        isMain: true,
      },
      {
        id: 2,
        src: "/kraft-paper-bowl-image.webp?height=500&width=500",
        alt: "Kraft Paper Bowl - Side View",
        isMain: false,
      },
      {
        id: 3,
        src: "/kraft-paper-bowl-image.webp?height=500&width=500",
        alt: "Kraft Paper Bowl - Top View",
        isMain: false,
      },
      {
        id: 4,
        src: "/kraft-paper-bowl-image.webp?height=500&width=500",
        alt: "Kraft Paper Bowl - Specifications",
        isMain: false,
      },
    ],
    printingOptions: ["Plain", "Customized Printing", "Logo Printing"],
    specifications: {
      capacity: "750 ML",
      material: "Kraft Paper",
      gsm: "320 GSM",
      type: "Food Grade",
      features: [
        "Virgin Kraft Paper Bowl With Lid",
        "Durable and disposable",
        "Attractive design and professional",
        "Carryout and takeout product",
        "Oil, water, and moisture resistant",
        "Perfect fitting of Lid",
      ],
    },
    description: `Do you want to store or distribute hot and cold items such as soups, chili, rice, salad, vegetable, curries, cookies, chocolate, or anything else? Gujarat Shopee offers an eco-friendly Kraft paper salad bowl with a lid available in 750 ML to store foods and distribute after packing. The bowl is best suited for food packaging along with household too. We are using high-quality food-grade paper and a transparent Lid which is having a perfect closer to the cover bowl. We have single, two and three-compartment bowl, you can get without compartment as well.

The salad bowl has 320 GSM Kraft material + Single PE with the base having 250 GSM Kraft cup paper + 15 GSM DPE, with the 330 Micron of Pet lid, the top size of the bowl has 148.50 MM and bottom have 128 MM along with the height of 63 MM.`,
  }
}

async function getRelatedProducts() {
  return [
    {
      id: "1",
      name: "500 ML Eco Friendly Brown Kraft Paper Salad Bowl Without Lid",
      description: "Plain And Customized Printing",
      price: 4.28,
      image: "/kraft-paper-bowl-image.webp?height=200&width=200",
    },
    {
      id: "2",
      name: "1000 ML Eco Friendly Brown Kraft Paper Salad Bowl Without Lid",
      description: "Plain And Customized Printing",
      price: 4.68,
      image: "/kraft-paper-bowl-image.webp?height=200&width=200",
    },
  ]
}

interface ProductDetailServerProps {
  productId: string
}

export async function ProductDetailServer({ productId }: ProductDetailServerProps) {
  const [product, relatedProducts] = await Promise.all([getProductDetails(productId), getRelatedProducts()])

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "PAPER BOWL - FOOD DISPOSABLE", href: "/paper-bowl-food-disposable" },
    { name: "Kraft Paper Bowl", href: "/kraft-paper-bowl" },
    { name: product.name, href: "#", isActive: true },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductBreadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Product Images */}
        <div className="space-y-4">
          <ProductImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <ProductInfo
            name={product.name}
            price={product.price}
            printingOptions={product.printingOptions}
            specifications={product.specifications}
          />
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <ProductTabs specifications={product.specifications} description={product.description} />
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  )
}
