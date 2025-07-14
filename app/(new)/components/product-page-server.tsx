import { ProductFilters } from "./product-filters"
import { ProductGrid } from "./product-grid"
import { ProductBreadcrumb } from "./product-breadcrumb"
import { MobileFilterButton } from "./mobile-filter-button"

// Mock data - in a real app, this would come from a database
async function getProducts() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  return [
    {
      id: 1,
      name: "500 ML Eco Friendly Brown Kraft Paper Salad Bowl Without Lid",
      description: "Plain And Customized Printing",
      price: 4.28,
      image: "/kraft-paper-bowl-image.webp?height=200&width=200",
      capacity: 500,
      category: "kraft-paper-bowl",
    },
    {
      id: 2,
      name: "750 ML Eco Friendly Brown Kraft Paper Salad Bowl Without Lid",
      description: "Plain And Customized Printing",
      price: 4.49,
      image: "/kraft-paper-bowl-image.webp?height=200&width=200",
      capacity: 750,
      category: "kraft-paper-bowl",
    },
    {
      id: 3,
      name: "1000 ML Eco Friendly Brown Kraft Paper Salad Bowl Without Lid",
      description: "Plain And Customized Printing",
      price: 4.68,
      image: "/kraft-paper-bowl-image.webp?height=200&width=200",
      capacity: 1000,
      category: "kraft-paper-bowl",
    },
  ]
}

async function getCategories() {
  return [
    {
      id: "paper-bowl-food-disposable",
      name: "PAPER BOWL - FOOD DISPOSABLE",
      count: 15,
      children: [
        { id: "kraft-paper-bowl", name: "Kraft Paper Bowl", count: 3 },
        { id: "white-paper-bowl", name: "White Paper Bowl", count: 5 },
        { id: "aluminium-foil-laminated", name: "Aluminium Foil Laminated Paper Bowl", count: 3 },
        { id: "bowl-lid", name: "BOWL LID", count: 2 },
      ],
    },
  ]
}

export async function ProductPageServer() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
   const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "PAPER BOWL - FOOD DISPOSABLE", href: "/paper-bowl-food-disposable" },
    { name: "Kraft Paper Bowl", href: "/kraft-paper-bowl", isActive: true  },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductBreadcrumb items={breadcrumbItems} />

      {/* Mobile Filter Button */}
      <MobileFilterButton categories={categories} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <aside className="lg:col-span-1 hidden lg:block">
          <ProductFilters categories={categories} />
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Kraft Paper Bowl</h1>
            <p className="text-gray-600 mb-4">
              Do you want to send some foods and deserts to your friends and family when they leaving your home, or do
              you have a business of foods and restaurant, then this is the best thing to use eco-friendly paper salad
              bowl for your business, family, and restaurant.{" "}
              <span className="font-semibold text-orange-600">Buy now Paper Salad Bowl Online</span> with different
              dimensions along with different colors & sizes.
            </p>
            <ul className="text-gray-600 space-y-1 mb-6">
              <li>• Eco -Friendly Kraft Paper Salad Bowl with Lid</li>
              <li>
                • Can use for salads packing, cookies, chocolates, dry fruits, even you can use for food with gravy
                packing.
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-orange-500 pb-2 inline-block">
              Kraft Paper Bowl - 3
            </h2>
          </div>

          <ProductGrid products={products} />
        </main>
      </div>
    </div>
  )
}
