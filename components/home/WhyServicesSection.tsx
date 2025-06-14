"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import Services from "@/models/home/Services"

export default function WhyServicesSection() {
  const [services, setServices] = useState<Services[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/why-services`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch services")
      }
      const data = await response.json()
      setServices(data)
    } catch (err) {
      setError("Unable to load services. Please try again later.")
      console.error("Error fetching services:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

        {error && (
          <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-red-600 hover:text-red-800"
                onClick={fetchServices}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-500 hover:bg-blue-50 text-sm px-4 py-2"
                    asChild
                  >
                    <a
                      href={
                        service.userType === "buyers"
                          ? "/buyers"
                          : service.userType === "suppliers"
                          ? "/suppliers"
                          : "/partners"
                      }
                      aria-label={`Learn more about ${service.title}`}
                    >
                      Learn More
                    </a>
                  </Button>
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