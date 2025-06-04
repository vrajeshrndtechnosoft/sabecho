"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight, Play, Shield, Search, TrendingUp, Users, Globe, Award, Target, CheckCircle, Factory, Building, Truck, Laptop } from "lucide-react"
import HeroSection from "@/components/home/HeroSection"
import TrustIndicators from "@/components/home/TrustIndicators"
import FeaturesSection from "@/components/home/FeaturesSection"
import CategoriesSection from "@/components/home/CategoriesSection"
import ServicesSection from "@/components/home/ServicesSection"
import HowItWorksSection from "@/components/home/HowItWorksSection"
import TestimonialsSection from "@/components/home/TestimonialsSection"
import AboutUsSection from "@/components/home/LeadershipSection"
import CTASection from "@/components/home/CTASection"
import RequirementsSection from "@/components/home/RequirementsSection"
import { Product, Category, Stat, Feature, Industry, Service, TeamMember, HowItWorksStep } from "@/components/types"
import { mockSearchData } from "@/components/mockData"
import WhyServicesSection from "@/components/home/WhyServicesSection"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timer)
      timer = setTimeout(() => func(...args), delay)
    }
  }

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      setIsSearchLoading(false)
      setOpenCombobox(false)
      return []
    }

    setIsSearchLoading(true)
    setOpenCombobox(true)

    try {
      const query = encodeURIComponent(term)
      const response = await fetch(`https://sabecho.com/api/v1/search?query=${query}`)
      const data = await response.json()
      setSearchResults(data)
      return data
    } catch (error) {
      console.error("Error fetching search results:", error)
      setSearchResults(mockSearchData)
      return mockSearchData
    } finally {
      setIsSearchLoading(false)
    }
  }

  const debouncedSearch = useCallback(debounce(handleSearch, 300), [])

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleProductClick = (product: Product) => {
    const parts = [product.categoryType, product.categorySubType, product.name, product.location].filter(Boolean)
    const url = `/products/${parts.join('/')}`.toLowerCase().replace(/\s+/g, '-')
    router.push(url)
    setOpenCombobox(false)
    setSearchTerm("")
    setSearchResults([])
  }

  const handleCategoryClick = (category: Category) => {
    router.push(`/categories/${category.slug}`)
  }

  const stats: Stat[] = [
    { label: "Businesses Connected", value: "50,000+", icon: Users },
    { label: "Transactions Facilitated", value: "₹500Cr+", icon: TrendingUp },
    { label: "Cities Covered", value: "25+", icon: Globe },
    { label: "Customer Satisfaction", value: "98%", icon: Star },
  ]

  const defaultFeatures: Feature[] = [
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "End-to-end encrypted payments with buyer protection and verified suppliers.",
    },
    {
      icon: Search,
      title: "Smart Matching",
      description: "AI-powered supplier matching based on your requirements and preferences.",
    },
    {
      icon: TrendingUp,
      title: "Best Prices",
      description: "Compare quotes from multiple suppliers to get the best deals for your business.",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "All suppliers are verified and rated by real customers for quality assurance.",
    },
  ]

  const industries: Industry[] = [
    { icon: Factory, name: "Manufacturing", count: "15,000+" },
    { icon: Building, name: "Construction", count: "12,000+" },
    { icon: Truck, name: "Logistics", count: "8,000+" },
    { icon: Laptop, name: "Technology", count: "10,000+" },
  ]

  const featuredServices: Service[] = [
    {
      id: 1,
      title: "Steel Procurement",
      slug: "steel-procurement",
      description: "Reliable steel sourcing from verified suppliers across India.",
      short_description: "Source high-quality steel at competitive prices.",
      features: {},
      pricing: {},
      image_url: "/images/steel-procurement.jpg",
      category: "Materials",
      is_featured: true,
      is_active: true,
    },
    {
      id: 2,
      title: "Electronics Supply",
      slug: "electronics-supply",
      description: "Bulk electronics sourcing with quality assurance.",
      short_description: "Get electronics components in bulk with ease.",
      features: {},
      pricing: {},
      image_url: "/images/electronics-supply.jpg",
      category: "Electronics",
      is_featured: true,
      is_active: true,
    },
    {
      id: 3,
      title: "Textile Sourcing",
      slug: "textile-sourcing",
      description: "Connect with top textile manufacturers for your business.",
      short_description: "Source textiles from trusted manufacturers.",
      features: {},
      pricing: {},
      image_url: "/images/textile-sourcing.jpg",
      category: "Textiles",
      is_featured: true,
      is_active: true,
    },
    {
      id: 4,
      title: "Machinery Leasing",
      slug: "machinery-leasing",
      description: "Lease industrial machinery with flexible terms.",
      short_description: "Access machinery without the upfront cost.",
      features: {},
      pricing: {},
      image_url: "/images/machinery-leasing.jpg",
      category: "Machinery",
      is_featured: true,
      is_active: true,
    },
  ]

  const leadershipTeam: TeamMember[] = [
    {
      id: 1,
      name: "Rahul Sharma",
      position: "CEO",
      bio: "Rahul has over 20 years of experience in B2B commerce and is passionate about empowering businesses.",
      image_url: "/images/rahul-sharma.jpg",
      email: "rahul@sabecho.com",
      department: "Executive",
      is_leadership: true,
      is_active: true,
    },
    {
      id: 2,
      name: "Priya Mehra",
      position: "COO",
      bio: "Priya oversees operations and ensures seamless transactions for all users on the platform.",
      image_url: "/images/priya-mehra.jpg",
      email: "priya@sabecho.com",
      department: "Operations",
      is_leadership: true,
      is_active: true,
    },
    {
      id: 3,
      name: "Vikram Singh",
      position: "CTO",
      bio: "Vikram leads the tech team, driving innovation in B2B trading solutions.",
      image_url: "/images/vikram-singh.jpg",
      email: "vikram@sabecho.com",
      department: "Technology",
      is_leadership: true,
      is_active: true,
    },
  ]

  const howItWorksSteps: HowItWorksStep[] = [
    {
      step: "1",
      title: "Post Your Requirement",
      description: "Tell us what you need with detailed specifications and quantity.",
      icon: Target,
    },
    {
      step: "2",
      title: "Get Multiple Quotes",
      description: "Receive competitive quotes from verified suppliers within 24 hours.",
      icon: Users,
    },
    {
      step: "3",
      title: "Choose & Order",
      description: "Compare quotes, select the best supplier, and place your order securely.",
      icon: CheckCircle,
    },
  ]

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white">
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
                      India&apos;s most trusted B2B marketplace connecting 50,000+ businesses.
                    </p>
                  </div>
                  <div className="relative animate-slide-up animation-delay-400">
                    <Input
                      placeholder="Search for products (e.g., Steel, Electronics, Textiles)"
                      className="w-full max-w-2xl mx-auto"
                      disabled
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-600">
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-gray-100"
                      disabled
                    >
                      Start Buying
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white"
                      disabled
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
                        <div key={index} className="text-center">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        stats={stats}
        searchResults={searchResults}
        isSearchLoading={isSearchLoading}
        onSearch={handleSearch}
        onProductClick={handleProductClick}
        setSearchResults={setSearchResults}
      />
      <TrustIndicators industries={industries} />
      <FeaturesSection features={defaultFeatures} />
      <CategoriesSection onCategoryClick={handleCategoryClick} />
      <WhyServicesSection/>
      <ServicesSection services={featuredServices} />
      <HowItWorksSection steps={howItWorksSteps} />
      <TestimonialsSection/>
      <AboutUsSection />
      <CTASection />
      <RequirementsSection />
    </div>
  )
}