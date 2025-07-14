import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Star, Quote, User } from "lucide-react";
import Image from "next/image";
import { Testimonial } from "@/components/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import "../../globals.css"; // Import the global CSS file

interface ApiTestimonial {
  _id: string;
  title: string;
  quote: string;
  name: string;
  position: string | null | undefined;
  backgroundColor: string;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialsSectionProps {
  testimonials: ApiTestimonial[];
  isLoading?: boolean;
  error?: string | null;
}

export default function TestimonialsSection({
  testimonials: apiTestimonials,
  isLoading = false,
  error = null,
}: TestimonialsSectionProps) {
  const testimonials: Testimonial[] = apiTestimonials
    .map((item) => {
      const id = Number.parseInt(item._id, 16);
      if (isNaN(id)) {
        console.warn(`Invalid ID format for testimonial: ${item._id}. Skipping.`);
        return null;
      }

      const [clientPosition, clientCompany] = (item.position ?? "").split(", ").map((str) => str.trim());

      return {
        id,
        testimonial: item.quote,
        client_name: item.name,
        client_position: clientPosition || item.position || "N/A",
        client_company: clientCompany || "Unknown Company",
        client_image: item.imagePath ? `/api/v1/explore-categories/image/${item.imagePath}` : null,
        rating: 5,
        is_featured: false,
        is_active: true,
      };
    })
    .filter((testimonial): testimonial is Testimonial => testimonial !== null);

  return (
    <div
      className="bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 relative">
            Success Stories
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-orange-500 rounded-full"></span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how businesses across India are thriving with Sabecho’s innovative solutions.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-10 max-w-xl mx-auto">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg">Error</AlertTitle>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex">
                      {[...Array(5)].map((__, j) => (
                        <Skeleton key={j} className="w-5 h-5 rounded-full bg-gray-300 mr-1" />
                      ))}
                    </div>
                    <Skeleton className="w-6 h-6 rounded-full bg-gray-300" />
                  </div>
                  <Skeleton className="h-5 w-full mb-2 bg-gray-300" />
                  <Skeleton className="h-4 w-3/4 bg-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full bg-gray-300" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32 bg-gray-300" />
                      <Skeleton className="h-3 w-24 bg-gray-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No testimonials available at this time.</p>
        ) : (
          <div className="relative overflow-hidden h-[500px]"> {/* Added fixed height to ensure visibility */}
            <div className="flex animate-scroll gap-6" style={{ minWidth: "max-content" }}>
              {[...testimonials, ...testimonials] // Duplicate testimonials for seamless looping
                .map((testimonial, index) => (
                  <Card
                    key={`${testimonial.id}-${index < testimonials.length ? 'a' : 'b'}`} // Unique key
                    className="border border-gray-200 shadow-md hover:shadow-xl hover:border-orange-400 transition-all duration-300 overflow-hidden group hover:scale-[1.02] min-w-[300px] flex-shrink-0"
                  >
                    <CardHeader className="bg-white p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <Quote className="w-6 h-6 text-orange-500" />
                      </div>
                      <CardDescription className="text-gray-700 text-base italic leading-relaxed">
                        &quot;{testimonial.testimonial}&quot;
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden border border-gray-300">
                          {testimonial.client_image ? (
                            <Image
                              src={testimonial.client_image}
                              alt={testimonial.client_name}
                              className="rounded-full object-cover"
                              width={56}
                              height={56}
                            />
                          ) : (
                            <User className="w-7 h-7 text-orange-500" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 text-lg">{testimonial.client_name}</div>
                          <div className="text-sm text-gray-600">{testimonial.client_position}</div>
                          <div className="text-sm text-gray-500">{testimonial.client_company}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}