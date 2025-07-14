import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import type Services from "@/models/home/Services";
import { Skeleton } from "@/components/ui/skeleton";

interface WhyServicesSectionProps {
  services: Services[];
  isLoading?: boolean;
}

export default function WhyServicesSection({ services, isLoading = false }: WhyServicesSectionProps) {
  return (
    <section
      className="py-24 bg-gray-50"
      style={{
        background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
      }}
      aria-labelledby="why-services-heading"
    >
      <div className="container mx-auto px-4">
        <header className="text-center mb-16">
          <h2
            id="why-services-heading"
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 relative"
          >
            Sabecho&apos;s Key Services
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-orange-500 rounded-full"></span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering our ecosystem of buyers, suppliers, and partners with innovative solutions.
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex justify-center p-6">
                  <Skeleton className="h-16 w-16 rounded-full bg-gray-300" />
                </CardHeader>
                <CardContent className="text-center p-6">
                  <Skeleton className="h-6 w-3/4 mx-auto mb-2 bg-gray-300" />
                  <Skeleton className="h-4 w-full mb-4 bg-gray-300" />
                  <Skeleton className="h-10 w-28 mx-auto bg-gray-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No services available at this time.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card
                key={service._id}
                className="border border-gray-200 shadow-md hover:shadow-xl hover:border-orange-400 transition-all duration-300 overflow-hidden group hover:scale-[1.02]"
                aria-labelledby={`service-title-${service._id}`}
              >
                <CardHeader className="flex justify-center p-6 bg-white">
                  {service.image && (
                    <Image
                      src={`/api/v1/explore-categories/image/${service.image}`}
                      alt={service.imageAlt || service.title}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="rounded-lg object-contain"
                    />
                  )}
                </CardHeader>
                <CardContent className="text-center p-6 pt-0 flex flex-col justify-between h-full">
                  <div>
                    <CardTitle
                      id={`service-title-${service._id}`}
                      className="text-xl font-semibold text-gray-900 mb-3"
                    >
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </div>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors duration-300 w-full mt-auto">
                    Learn More
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}