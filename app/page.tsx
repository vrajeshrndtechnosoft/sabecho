"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Shield,
  TrendingUp,
  Users,
  Globe,
  Star,
  ArrowRight,
  Play,
  Award,
  Building,
  Factory,
  Truck,
  Laptop,
  User,
  Quote,
  CheckCircle,
  Target,
} from "lucide-react"
import Image from "next/image"

interface Product {
  _id: string
  location: string
  categoryType: string
  categorySubType: string
  name: string
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const router = useRouter()

  // Mock search data as fallback
  const mockSearchData: Product[] = [
    {
      _id: "6662d7ec9faced272e8a6c67",
      location: "vapi",
      categoryType: "Polymers and Packaging",
      categorySubType: "Premium Boxes",
      name: "White Carton Boxes",
    },
    {
      _id: "6662d7ed9faced272e8a6c85",
      location: "vapi",
      categoryType: "Polymers and Packaging",
      categorySubType: "Premium Boxes",
      name: "White Carton Boxes",
    },
  ]

  // Debounce function to delay search
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timer)
      timer = setTimeout(() => func(...args), delay)
    }
  }

  // Search handler
  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      setIsSearchLoading(false)
      return
    }

    setIsSearchLoading(true)

    try {
      const query = encodeURIComponent(term)
      const response = await fetch(`https://sabecho.com/api/v1/search?query=${query}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error fetching search results:", error)
      // Fallback to mock data
      setSearchResults(mockSearchData)
    } finally {
      setIsSearchLoading(false)
    }
  }

  // Debounced search function
  const debouncedSearch = useCallback(debounce(handleSearch, 300), [])

  // Real-time search with useEffect
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleProductClick = (product: Product) => {
    const url = `http://localhost:3000/products/${encodeURIComponent(product.categoryType)}/${encodeURIComponent(product.categorySubType)}/${encodeURIComponent(product.name)}/${encodeURIComponent(product.location)}`
    router.push(url)
  }

  const stats = [
    { label: "Businesses Connected", value: "50,000+", icon: Users },
    { label: "Transactions Facilitated", value: "₹500Cr+", icon: TrendingUp },
    { label: "Cities Covered", value: "25+", icon: Globe },
    { label: "Customer Satisfaction", value: "98%", icon: Star },
  ]

  const defaultFeatures = [
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

  const industries = [
    { icon: Factory, name: "Manufacturing", count: "15,000+" },
    { icon: Building, name: "Construction", count: "12,000+" },
    { icon: Truck, name: "Logistics", count: "8,000+" },
    { icon: Laptop, name: "Technology", count: "10,000+" },
  ]

  const featuredServices = [
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

  const leadershipTeam = [
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

  const featuredTestimonials = [
    {
      id: 1,
      client_name: "Amit Patel",
      client_position: "Director",
      client_company: "Patel Industries",
      client_image: "/images/amit-patel.jpg",
      testimonial: "Sabecho transformed our procurement process. We now source materials 30% cheaper!",
      rating: 5,
      is_featured: true,
      is_active: true,
    },
    {
      id: 2,
      client_name: "Sneha Gupta",
      client_position: "Supply Chain Manager",
      client_company: "Gupta Logistics",
      client_image: "/images/sneha-gupta.jpg",
      testimonial: "The platform is incredibly user-friendly, and the support team is top-notch.",
      rating: 4,
      is_featured: true,
      is_active: true,
    },
    {
      id: 3,
      client_name: "Rohit Desai",
      client_position: "CEO",
      client_company: "Desai Tech",
      client_image: "/images/rohit-desai.jpg",
      testimonial: "Thanks to Sabecho, we scaled our operations across 10 cities seamlessly.",
      rating: 5,
      is_featured: true,
      is_active: true,
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
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

                  {/* Search Bar with Relative Positioning */}
                  <div className="relative animate-slide-up animation-delay-400">
                    <div className="bg-white rounded-lg shadow-xl">
                      <div className="flex items-center">
                        <Search className="absolute left-4 text-gray-400 w-6 h-6" />
                        <Input
                          placeholder="Search for products (e.g., Steel, Electronics, Textiles)"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-14 border-0 text-gray-900 text-lg focus:ring-0 bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Search Results Positioned Absolutely Relative to Search Bar */}
                    {(isSearchLoading || searchResults.length > 0) && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg p-4 shadow-xl max-h-96 overflow-y-auto z-20">
                        {isSearchLoading ? (
                          <div className="space-y-4">
                            {[1, 2].map((i) => (
                              <Card key={i} className="animate-pulse">
                                <CardHeader className="flex flex-row items-center gap-4">
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                                  <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                                  </div>
                                </CardHeader>
                              </Card>
                            ))}
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="text-center text-gray-600 py-4">
                            <p>No results found for &quot;{searchTerm}&quot;.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {searchResults.map((product) => (
                              <Card
                                key={product._id}
                                className="hover:shadow-lg transition-all duration-300 group cursor-pointer"
                                onClick={() => handleProductClick(product)}
                              >
                                <CardHeader className="flex flex-row items-center gap-4">
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Globe className="w-8 h-8 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <Badge className="mb-2">{product.categorySubType}</Badge>
                                    <CardTitle className="text-lg">{product.name}</CardTitle>
                                    <CardDescription>
                                      Category: {product.categoryType} | Location: {product.location}
                                    </CardDescription>
                                  </div>
                                </CardHeader>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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

        {/* Trust Indicators */}
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg">Trusted by leading businesses across India</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {industries.map((industry, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <industry.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{industry.name}</h3>
                  <p className="text-blue-600 font-medium">{industry.count} businesses</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Sabecho?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make B2B trading simple, secure, and profitable for businesses of all sizes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {defaultFeatures.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 border-0 shadow-md group hover:scale-105"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Services */}
        <div className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our most popular services trusted by thousands of businesses.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-all duration-300 group hover:scale-105">
                  <CardHeader>
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      {service.image_url ? (
                        <Image
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          width={400}
                          height={192}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <Globe className="w-12 h-12 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <Badge className="mb-2">{service.category}</Badge>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription>{service.short_description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and connect with verified suppliers across India.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
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
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105">
              Start Your First Order
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how businesses across India are growing with Sabecho.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredTestimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="hover:shadow-lg transition-all duration-300 group hover:scale-105"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardDescription className="text-gray-700 text-base italic">
                      &quot;{testimonial.testimonial}&quot;
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {testimonial.client_image ? (
                          <Image
                            src={testimonial.client_image}
                            alt={testimonial.client_name}
                            className="w-full h-full rounded-full object-cover"
                            width={48}
                            height={48}
                          />
                        ) : (
                          <User className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.client_name}</div>
                        <div className="text-sm text-gray-600">{testimonial.client_position}</div>
                        <div className="text-sm text-gray-500">{testimonial.client_company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the visionaries driving India&apos;s B2B commerce transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {leadershipTeam.map((member) => (
              <Card
                key={member.id}
                className="text-center hover:shadow-lg transition-all duration-300 group hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        width={96}
                        height={96}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
              <p className="text-xl mb-8 text-blue-100">
                Join 50,000+ businesses already growing with Sabecho. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Start Buying Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                  Become a Supplier
                </Button>
              </div>
              <div className="mt-8 text-blue-200">
                <p>✓ Free to join ✓ No setup fees ✓ 24/7 support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}