import WhyChooseSection from "../components/why-choose-section";
import ImageCarousel from "../components/carousel";
import TestimonialsSection from "../components/testimonials";
import ProductCategorySection from './../components/product-category';
import WhyServicesSection from "../components/why-service-section";
import AboutUsSection from "../components/about-section";
import CategoriesSection from "../components/categories-section";


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


export default async function Home() {
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
    <div className="min-h-screen">
      {/* Demo content to show scrolling effect */}
        <div className="container mx-auto px-4">
          <ImageCarousel/> 
          <CategoriesSection categories={categoriesData} />
           <ProductCategorySection categories={categoriesData}/>
           <WhyChooseSection whyChooseData={whyChooseData} />
           <WhyServicesSection services={whyServicesData} />
           <TestimonialsSection testimonials={testimonialsData}/>
           <AboutUsSection aboutUsData={aboutUsData} />
        </div>
    </div>
  )
}
