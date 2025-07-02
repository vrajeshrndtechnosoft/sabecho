import { Star, TrendingUp, Users, Globe, Target, CheckCircle, Factory, Building, Truck, Laptop } from "lucide-react"
import HeroSection from "@/components/home/hero-section"
import TrustIndicators from "@/components/home/trust-indicators"
import CategoriesSection from "@/components/home/categories-section"
import HowItWorksSection from "@/components/home/how-it-work-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import AboutUsSection from "@/components/home/about-us-section"
import CTASection from "@/components/home/cta-section"
import WhyServicesSection from "@/components/home/why-services-section"
import WhyChooseSection from "@/components/home/why-choose-section"
import type { Stat, Industry, HowItWorksStep } from "@/components/types"
import Footer from "@/components/home/footer"

// Server-side data fetching functions
async function getAboutUsData() {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/v1/about-us`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // Revalidate every hour
    })
    if (!response.ok) throw new Error("Failed to fetch About Us data")
    const data = await response.json()
    return data[0] || null
  } catch (error) {
    console.error("Error fetching About Us data:", error)
    return null
  }
}

async function getCategoriesData() {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/v1/explore-categories`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      },
    )
    if (!response.ok) throw new Error("Failed to fetch categories")
    return await response.json()
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

async function getWhyChooseData() {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/v1/why-choose`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    })
    if (!response.ok) throw new Error("Failed to fetch Why Choose data")
    return await response.json()
  } catch (error) {
    console.error("Error fetching Why Choose data:", error)
    return []
  }
}

async function getWhyServiceData() {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/v1/why-services`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    })
    if (!response.ok) throw new Error("Failed to fetch Why Services data")
    return await response.json()
  } catch (error) {
    console.error("Error fetching Why Services data:", error)
    return []
  }
}

async function getTestimonialsData() {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/v1/testimonials`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    })
    if (!response.ok) throw new Error("Failed to fetch testimonials")
    return await response.json()
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return []
  }
}

export default async function HomePage() {
  // Static data that doesn't need API calls
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

  // Fetch all data in parallel
  const [aboutUsData, categoriesData, whyServicesData, whyChooseData, testimonialsData] =
    await Promise.all([
      getAboutUsData(),
      getCategoriesData(),
      getWhyChooseData(),
      getTestimonialsData(),
      getWhyServiceData(),
    ])

  return (
    <>
      <div className="min-h-screen bg-white">
        <HeroSection stats={stats} />
        <TrustIndicators industries={industries} />
        <CategoriesSection categories={categoriesData} />
        <WhyServicesSection services={whyServicesData} />
        <WhyChooseSection whyChooseData={whyChooseData} />
        <HowItWorksSection steps={howItWorksSteps} />
        <TestimonialsSection testimonials={testimonialsData} />
        <AboutUsSection aboutUsData={aboutUsData} />
        <CTASection />
      </div>
      <Footer />
    </>
  )
}
