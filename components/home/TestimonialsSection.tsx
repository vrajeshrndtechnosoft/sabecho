"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Star, Quote, User } from "lucide-react"
import Image from "next/image"
import { Testimonial } from "@/components/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ApiTestimonial {
  _id: string
  title: string
  quote: string
  name: string
  position: string
  backgroundColor: string
  imagePath: string
  createdAt: string
  updatedAt: string
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTestimonials = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("https://sabecho.com/api/v1/testimonials", {
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch testimonials")
      }
      const data: ApiTestimonial[] = await response.json()

      // Map API response to Testimonial type
      const mappedTestimonials: Testimonial[] = data.map((item) => {
        // Split position to extract company (e.g., "CEO, Tech Solutions Pvt. Ltd" -> ["CEO", "Tech Solutions Pvt. Ltd"])
        const [clientPosition, clientCompany] = item.position.split(", ").map((str) => str.trim())
        return {
          id: item._id,
          testimonial: item.quote,
          client_name: item.name,
          client_position: clientPosition || item.position,
          client_company: clientCompany || "Unknown Company",
          client_image: item.imagePath
            ? `https://sabecho.com/api/v1/explore-categories/image/${item.imagePath}`
            : null,
          rating: 5, // Default rating since API doesn't provide it
          is_featured: false, // Default to false since API doesn't provide this
          is_active: true, // Default to true, assuming all fetched testimonials are active
        }
      })
      setTestimonials(mappedTestimonials)
    } catch (err) {
      setError("Unable to load testimonials. Please try again later.")
      console.error("Error fetching testimonials:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how businesses across India are growing with Sabecho.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-red-600 hover:text-red-800"
                onClick={fetchTestimonials}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-none shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex">
                      {[...Array(5)].map((__, j) => (
                        <Skeleton key={j} className="w-5 h-5 rounded-full mr-1" />
                      ))}
                    </div>
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-gray-600">No testimonials available at this time.</p>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial) => (
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
                          onError={(e) => {
                            console.error(`Failed to load image: ${e.currentTarget.src}`)
                            e.currentTarget.style.display = "none"
                          }}
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
        )}
      </div>
    </div>
  )
}