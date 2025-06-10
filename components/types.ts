export interface Product {
  _id: string
  location: string
  categoryType: string
  categorySubType: string
  name: string
  measurementOptions?: string[]
  p_name:string
  brand:string
}

export interface UserDetails {
  _id: string
  email: string
  name: string
  companyName: string
  mobileNo: string
  gstNo: string
  userType: string
  pincode: string
  verify: boolean
  shippingDetails: string
  tradeNam: string
  profileImage: string
  userId: string
  billingDetails: string
  createdAt: string
}


export interface VerifyTokenResponse {
  email?: string
  userId?: string
  message?: string
  userType?: string
}

export interface Category {
  _id: string
  title: string
  slug: string
  productNames: string[]
  image: {
    url: string
    altText: string
  }
  metaDescription: string
  keywords: string[]
  createdAt: string
  updatedAt: string
}

export interface Stat {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

export interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export interface Industry {
  icon: React.ComponentType<{ className?: string }>
  name: string
  count: string
}

export interface Service {
  id: number
  title: string
  slug: string
  description: string
  short_description: string
  features: Record<string, unknown>
  pricing: Record<string, unknown>
  image_url: string
  category: string
  is_featured: boolean
  is_active: boolean
}

export interface TeamMember {
  id: number
  name: string
  position: string
  bio: string
  image_url: string
  email: string
  department: string
  is_leadership: boolean
  is_active: boolean
}

export interface Testimonial {
  id: number
  client_name: string
  client_position: string
  client_company: string
  client_image: string
  testimonial: string
  rating: number
  is_featured: boolean
  is_active: boolean
}

export interface HowItWorksStep {
  step: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}
