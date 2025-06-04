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
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 animate-fade-in">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">India&apos;s #1 B2B Marketplace</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-slide-up">
                  Connect. Trade. <span className="text-yellow-400">Grow.</span>
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed animate-slide-up animation-delay-200">
                  India&apos;s most trusted B2B marketplace connecting 50,000+ businesses. Find verified suppliers, compare quotes, and grow your business with confidence.
                </p>
              </div>

              <div className="relative animate-slide-up animation-delay-400">
                <SearchCombobox<Product>
                  label="Search Products"
                  className="text-white font-bold text-lg"
                  placeholder="Search for products (e.g., Steel, Electronics, Textiles)"
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

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-600">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Start Buying
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="relative animate-slide-up animation-delay-800">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-colors">
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-blue-200 text-sm">{stat.label}</div>
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
