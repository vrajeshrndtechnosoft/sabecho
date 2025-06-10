"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight, Play, TrendingUp, Users, Globe, Target, CheckCircle, Factory, Building, Truck, Laptop } from "lucide-react"
import HeroSection from "@/components/home/HeroSection"
import TrustIndicators from "@/components/home/TrustIndicators"
import CategoriesSection from "@/components/home/CategoriesSection"
import HowItWorksSection from "@/components/home/HowItWorksSection"
import TestimonialsSection from "@/components/home/TestimonialsSection"
import AboutUsSection from "@/components/home/LeadershipSection"
import CTASection from "@/components/home/CTASection"
import RequirementsSection from "@/components/home/RequirementsSection"
import { Product, Category, Stat, Industry, HowItWorksStep } from "@/components/types"
import WhyServicesSection from "@/components/home/WhyServicesSection"
import WhyChooseItem from "@/components/home/WhyChooseItem"
import Footer from "@/components/home/Footer"

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleProductClick = (product: Product) => {
    // Create URL from product data
    const parts = [product.categoryType, product.categorySubType, product.name, product.location].filter(Boolean)
    const url = `/products/${parts.join('/')}`.toLowerCase().replace(/\s+/g, '-')
    router.push(url)
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

  const industries: Industry[] = [
    { icon: Factory, name: "Manufacturing", count: "15,000+" },
    { icon: Building, name: "Construction", count: "12,000+" },
    { icon: Truck, name: "Logistics", count: "8,000+" },
    { icon: Laptop, name: "Technology", count: "10,000+" },
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
    <>
      <div className="min-h-screen bg-white">
        <HeroSection
          stats={stats}
          onProductClick={handleProductClick}
        />
        <TrustIndicators industries={industries} />
        <CategoriesSection onCategoryClick={handleCategoryClick} />
        <WhyServicesSection />
        <WhyChooseItem />
        <HowItWorksSection steps={howItWorksSteps} />
        <TestimonialsSection />
        <AboutUsSection />
        <CTASection />
        <RequirementsSection />
      </div>
      <Footer />
    </>
  )
}