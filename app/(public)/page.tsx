import { Star, TrendingUp, Users, Globe } from "lucide-react"
import HeroSection from "@/components/home/hero-section"
import CategoriesSection from "@/components/home/categories-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import AboutUsSection from "@/components/home/about-us-section"
import WhyServicesSection from "@/components/home/why-services-section"
import WhyChooseSection from "@/components/home/why-choose-section"
import type { Stat } from "@/components/types"
import Footer from "@/components/home/footer"
import RequirementsForm from "@/components/products/requirements-form"

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

  // Fetch all data in parallel
  const [aboutUsData, categoriesData, whyServicesData, whyChooseData, testimonialsData] =
    await Promise.all([
      getAboutUsData(),
      getCategoriesData(),
      getWhyServiceData(),
      getWhyChooseData(),
      getTestimonialsData(),
      getWhyServiceData(),
    ])

  return (
    <>
      <div className="min-h-screen bg-white">
        <HeroSection stats={stats} />
        <CategoriesSection categories={categoriesData} />
        <WhyServicesSection services={whyServicesData} />
        <WhyChooseSection whyChooseData={whyChooseData} />
        <TestimonialsSection testimonials={testimonialsData} />
        <AboutUsSection aboutUsData={aboutUsData} />
        <div className="mx-auto flex items-center justify-center max-w-7xl min-w-full h-full my-1.5">
          <RequirementsForm/>
        </div>
        
      </div>
      <Footer />
    </>
  )
}
