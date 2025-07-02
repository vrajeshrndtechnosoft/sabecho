import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import BreadcrumbServer from "./breadcrumb-server"
import RequirementsForm from "./requirements-form"
import FavoriteButtonClient from "./favourite-button-client"
import {
  fetchCategories,
  fetchProductData,
  fetchUserFavorites,
  getUniqueProducts,
  normalizeSegment,
  generateSEOFriendlyURL,
  type Product,
  type Category,
  type Favorite,
} from "@/lib/product-server-utils"

interface ProductDisplayServerProps {
  category?: string
  subcategory?: string
  product?: string
  location?: string
  searchQuery?: string
}

export default async function ProductDisplayServer({
  category,
  subcategory,
  product,
  location,
  searchQuery,
}: ProductDisplayServerProps) {
  const [categories, favorites] = await Promise.all([fetchCategories(), fetchUserFavorites()])

  // Handle global search
  if (searchQuery?.trim()) {
    const allProducts = categories.flatMap((cat) => cat.subCategory.flatMap((sub) => sub.product))
    const searchResults = allProducts.filter(
      (prod) =>
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
      <div className="p-3 md:p-4 lg:p-6 xl:p-8">
        <div className="max-w-7xl mx-auto">
          <BreadcrumbServer category={category} subcategory={subcategory} product={product} location={location} />
          <SearchResults products={searchResults} searchQuery={searchQuery} favorites={favorites} />
        </div>
      </div>
    )
  }

  // Fetch specific product data if we have URL parameters
  let products: Product[] = []
  if (category) {
    products = await fetchProductData(category, subcategory, product, location)
  }

  return (
    <div className="p-3 md:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto">
        <BreadcrumbServer category={category} subcategory={subcategory} product={product} location={location} />

        <Suspense fallback={<ProductDisplayLoading />}>
          {!category ? (
            <CategoriesView categories={categories} />
          ) : !subcategory ? (
            <CategoryView category={category} categories={categories} />
          ) : !product ? (
            <SubcategoryView category={category} subcategory={subcategory} products={products} favorites={favorites} />
          ) : !location ? (
            <ProductView
              category={category}
              subcategory={subcategory}
              product={product}
              products={products}
              favorites={favorites}
            />
          ) : (
            <LocationView
              category={category}
              subcategory={subcategory}
              product={product}
              location={location}
              products={products}
              favorites={favorites}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}

function ProductDisplayLoading() {
  return (
    <div className="flex items-center justify-center h-32 md:h-48 lg:h-64">
      <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 border-b-2 border-blue-600"></div>
    </div>
  )
}

function CategoriesView({ categories }: { categories: Category[] }) {
  return (
    <div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">All Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="group border rounded-lg p-6 hover:shadow-lg transition-all duration-200 bg-white hover:border-blue-200 flex flex-col min-h-[280px]"
          >
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {category.category}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{category.subCategory.length} subcategories</p>
                <p className="text-xs text-gray-500">
                  {category.subCategory.reduce((total, sub) => total + sub.product.length, 0)} total products
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link href={generateSEOFriendlyURL(category.category)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 text-sm px-4 h-10 group-hover:bg-blue-600 group-hover:text-white transition-all bg-transparent"
                >
                  Explore Category
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryView({ category, categories }: { category: string; categories: Category[] }) {
  const selectedCategory = categories.find((cat) => normalizeSegment(cat.category) === normalizeSegment(category))

  if (!selectedCategory) {
    return <div className="p-4 md:p-6 text-gray-500 text-sm text-center">Category not found.</div>
  }

  return (
    <div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
        {selectedCategory.category} Subcategories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {selectedCategory.subCategory.map((sub) => (
          <div key={sub._id} className="border rounded-lg p-3 md:p-4 lg:p-5 hover:shadow-lg transition-shadow bg-white">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2 md:mb-3">{sub.name}</h3>
            <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
              <p className="text-xs md:text-sm text-gray-600">
                {sub.distinctProductCount || sub.product.length} unique products
              </p>
              <p className="text-xs text-gray-500">{sub.product.length} total variants</p>
            </div>
            <Link href={generateSEOFriendlyURL(selectedCategory.category, sub.name)}>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs md:text-sm px-3 md:px-4 h-7 md:h-8 lg:h-10 w-full bg-transparent"
              >
                View Products
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function SubcategoryView({
  category,
  subcategory,
  products,
  favorites,
}: {
  category: string
  subcategory: string
  products: Product[]
  favorites: Favorite[]
}) {
  const uniqueProducts = getUniqueProducts(products)

  return (
    <div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
        {subcategory
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}{" "}
        Products
      </h2>
      <ProductTable products={uniqueProducts} favorites={favorites} category={category} subcategory={subcategory} />
    </div>
  )
}

function ProductView({
  category,
  subcategory,
  product,
  products,
  favorites,
}: {
  category: string
  subcategory: string
  product: string
  products: Product[]
  favorites: Favorite[]
}) {
  const productName = normalizeSegment(product)
  const filteredProducts = products.filter((p) => normalizeSegment(p.name) === productName)

  return (
    <div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6 capitalize">
        {product.replace(/-/g, " ")}
      </h2>
      <ProductTable products={filteredProducts} favorites={favorites} category={category} subcategory={subcategory} />
    </div>
  )
}

function LocationView({
  category,
  subcategory,
  product,
  location,
  products,
  favorites,
}: {
  category: string
  subcategory: string
  product: string
  location: string
  products: Product[]
  favorites: Favorite[]
}) {
  const productName = normalizeSegment(product)
  const locationName = normalizeSegment(location)
  const filteredProducts = products.filter(
    (p) => normalizeSegment(p.name) === productName && normalizeSegment(p.location) === locationName,
  )

  return (
    <div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6 capitalize">
        {product.replace(/-/g, " ")} in {location.replace(/-/g, " ")}
      </h2>
      <ProductTable products={filteredProducts} favorites={favorites} category={category} subcategory={subcategory} />
    </div>
  )
}

function ProductTable({
  products,
  favorites,
  category,
  subcategory,
}: {
  products: Product[]
  favorites: Favorite[]
  category: string
  subcategory: string
}) {
  const isProductFavorite = (productName: string) => {
    return favorites.some((fav) => normalizeSegment(fav.name) === normalizeSegment(productName))
  }

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
            <th className="p-3 md:p-4 font-semibold">Product</th>
            <th className="p-3 md:p-4 font-semibold">Location</th>
            <th className="p-3 md:p-4 font-semibold hidden md:table-cell">Description</th>
            <th className="p-3 md:p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((prod) => (
              <tr key={prod._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 md:p-3">
                  <Link
                    href={generateSEOFriendlyURL(category, subcategory, prod.name)}
                    className="text-gray-600 hover:text-blue-500 font-medium text-sm md:text-base"
                  >
                    {prod.name}
                  </Link>
                </td>
                <td className="p-2 md:p-3 text-xs md:text-sm">{prod.location}</td>
                <td className="p-2 md:p-3 text-xs md:text-sm hidden md:table-cell">{prod.description}</td>
                <td className="p-2 md:p-3">
                  <div className="flex items-center space-x-1 md:space-x-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 h-7 md:h-9 text-xs md:text-sm bg-transparent px-2 md:px-3"
                        >
                          Inquiry
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="p-0 max-w-[95vw] w-full sm:max-w-md md:max-w-3xl rounded-lg">
                        <DialogTitle className="mt-4 md:mt-6 px-4 md:px-6 text-sm md:text-base">
                          Inquiry for {prod.name}
                        </DialogTitle>
                        <RequirementsForm initialProduct={prod} />
                      </DialogContent>
                    </Dialog>
                    <FavoriteButtonClient
                      productName={prod.name}
                      productId={prod._id}
                      isFavorite={isProductFavorite(prod.name)}
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-6 md:p-8 text-center text-gray-500 text-sm">
                No products found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function SearchResults({
  products,
  searchQuery,
  favorites,
}: {
  products: Product[]
  searchQuery: string
  favorites: Favorite[]
}) {
  const isProductFavorite = (productName: string) => {
    return favorites.some((fav) => normalizeSegment(fav.name) === normalizeSegment(productName))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
          Search Results for &quot;{searchQuery}&quot;
        </h2>
        <span className="text-sm text-gray-600">{products.length} products found</span>
      </div>

      {products.length > 0 ? (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="p-3 md:p-4 font-semibold">Product</th>
                <th className="p-3 md:p-4 font-semibold">Location</th>
                <th className="p-3 md:p-4 font-semibold">Category</th>
                <th className="p-3 md:p-4 font-semibold">Subcategory</th>
                <th className="p-3 md:p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 md:p-3">
                    <Link
                      href={generateSEOFriendlyURL(product.categoryType, product.categorySubType, product.name)}
                      className="text-gray-600 hover:text-blue-500 font-medium text-sm md:text-base"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="p-2 md:p-3 text-xs md:text-sm">{product.location}</td>
                  <td className="p-2 md:p-3 text-xs md:text-sm">{product.categoryType}</td>
                  <td className="p-2 md:p-3 text-xs md:text-sm">{product.categorySubType}</td>
                  <td className="p-2 md:p-3">
                    <div className="flex items-center space-x-1 md:space-x-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50 h-7 md:h-9 text-xs md:text-sm bg-transparent px-2 md:px-3"
                          >
                            Inquiry
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-[95vw] w-full sm:max-w-md md:max-w-3xl rounded-lg">
                          <DialogTitle className="mt-4 md:mt-6 px-4 md:px-6 text-sm md:text-base">
                            Inquiry for {product.name}
                          </DialogTitle>
                          <RequirementsForm initialProduct={product} />
                        </DialogContent>
                      </Dialog>
                      <FavoriteButtonClient
                        productName={product.name}
                        productId={product._id}
                        isFavorite={isProductFavorite(product.name)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 md:p-8 text-center text-gray-500 text-sm bg-white rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-1">No products found</h3>
          <p>Try different search terms or browse categories.</p>
        </div>
      )}
    </div>
  )
}
