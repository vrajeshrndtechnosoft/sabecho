"use client"

import { Button } from "@/components/ui/button"
import { Star, ArrowRight, Play } from "lucide-react"
import SearchCombobox from "@/components/product-search"
import { Product, Stat } from "@/components/types"

interface HeroSectionProps {
  stats: Stat[]
  searchResults: Product[]
  isSearchLoading: boolean
  onSearch: (term: string) => Promise<Product[]>
  onProductClick: (product: Product) => void
  setSearchResults: (results: Product[]) => void
}

export default function HeroSection({
  stats,
  searchResults,
  onSearch,
  onProductClick,
  setSearchResults,
}: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-6 py-16 sm:py-20 lg:py-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="text-sm sm:text-base">India&apos;s #1 B2B Marketplace</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight lg:leading-snug">
                  Connect. Trade. <span className="text-yellow-400">Grow.</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 leading-relaxed lg:leading-loose max-w-xl">
                  India&apos;s most trusted B2B marketplace connecting 50,000+ businesses. Find verified suppliers, compare quotes, and grow with confidence.
                </p>
              </div>

              <div className="relative max-w-lg">
                <SearchCombobox<Product>
                  label="Search Products"
                  className="text-white font-bold text-base sm:text-lg lg:text-xl"
                  placeholder="Search for products (e.g., Steel, Electronics)"
                  searchPlaceholder="Search products..."
                  data={searchResults}
                  value={null}
                  onChange={(product) => product && onProductClick(product)}
                  onSearch={async (term: string) => {
                    const results = await onSearch(term)
                    setSearchResults(results)
                    return results
                  }}
                  displayField="name"
                  valueField="_id"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105 w-full sm:w-auto text-sm sm:text-base lg:text-lg h-12 sm:h-12 lg:h-14"
                >
                  Start Buying
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-blue-600 hover:bg-white hover:text-blue-600 transition-all duration-300 w-full sm:w-auto text-sm sm:text-base lg:text-lg h-12 sm:h-12 lg:h-14"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 group-hover:bg-white/30 transition-colors">
                        <stat.icon className="w-6 h-6 lg:w-8 lg:h-8" />
                      </div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-blue-200 text-sm lg:text-base">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}