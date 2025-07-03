import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import type Services from "@/models/home/Services"
import { Skeleton } from "../ui/skeleton"

interface WhyServicesSectionProps {
  services: Services[],
  isLoading?: boolean
}

export default function WhyServicesSection({ services, isLoading = false  }: WhyServicesSectionProps) {
  return (
    <>
    <section
      className="py-16 bg-gradient-to-b from-gray-50 to-white"
      aria-labelledby="why-services-heading"
    >
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h2
            id="why-services-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Sabecho&apos;s Key Services
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Delivering value to our ecosystem of buyers, suppliers, and channel partners.
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none shadow-lg">
                <CardHeader className="flex justify-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </CardHeader>
                <CardContent className="text-center">
                  <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                  <Skeleton className="h-10 w-32 mx-auto mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-600">No services available at this time.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card
                key={service._id}
                className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300"
                aria-labelledby={`service-title-${service._id}`}
              >
                <CardHeader className="flex justify-center">
                  {service.image && (
                    <Image
                      src={`/api/v1/explore-categories/image/${service.image}`} 
                      alt={service.imageAlt}
                      width={48}
                      height={48}
                      loading="lazy"
                    />
                  )}
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle
                    id={`service-title-${service._id}`}
                    className="text-lg font-semibold text-gray-900 mb-2"
                  >
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm mb-4">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
    </>
  )
}
