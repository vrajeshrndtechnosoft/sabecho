import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Star, Quote, User } from "lucide-react"
import Image from "next/image"
import type { Testimonial } from "@/components/types"

interface ApiTestimonial {
  _id: string
  title: string
  quote: string
  name: string
  position: string // This might be undefined/null from the API
  backgroundColor: string
  imagePath: string
  createdAt: string
  updatedAt: string
}

interface TestimonialsSectionProps {
  testimonials: ApiTestimonial[]
}

export default function TestimonialsSection({ testimonials: apiTestimonials }: TestimonialsSectionProps) {
  // Map API response to Testimonial type
  const testimonials: Testimonial[] = apiTestimonials
    .map((item) => {
      const id = Number.parseInt(item._id, 16)
      if (isNaN(id)) {
        console.warn(`Invalid ID format for testimonial: ${item._id}. Skipping.`)
        return null
      }

      // Safely access item.position, providing an empty string if it's null or undefined
      const [clientPosition, clientCompany] = (item.position ?? "").split(", ").map((str) => str.trim())

      return {
        id,
        testimonial: item.quote,
        client_name: item.name,
        client_position: clientPosition || item.position,
        client_company: clientCompany || "Unknown Company",
        client_image: item.imagePath ? `/api/v1/explore-categories/image/${item.imagePath}` : null,
        rating: 5,
        is_featured: false,
        is_active: true,
      }
    })
    .filter((testimonial): testimonial is Testimonial => testimonial !== null)

  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how businesses across India are growing with Sabecho.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <p className="text-center text-gray-600">No testimonials available at this time.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-all duration-300 group hover:scale-105">
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
                          src={testimonial.client_image || "/placeholder.svg"}
                          alt={testimonial.client_name}
                          className="rounded-full object-cover"
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
        )}
      </div>
    </div>
  )
}
