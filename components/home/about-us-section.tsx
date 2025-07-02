import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface AboutUsImage {
  image: {
    url: string
    altText: string
  }
  title: string
  description: string
  _id: string
}

interface AboutUsData {
  _id: string
  title: string
  description: string
  listOfImages: AboutUsImage[]
  createdAt: string
  updatedAt: string
}

interface AboutUsSectionProps {
  aboutUsData: AboutUsData | null
}

export default function AboutUsSection({ aboutUsData }: AboutUsSectionProps) {
  if (!aboutUsData) {
    return (
      <div className="container mx-auto px-4 py-20">
        <p className="text-center text-gray-600">No About Us information available at this time.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{aboutUsData.title}</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">{aboutUsData.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
        {aboutUsData.listOfImages.map((item) => (
          <Card
            key={item._id}
            className="text-center hover:shadow-lg transition-all duration-300 group hover:scale-105"
          >
            <CardContent className="p-6">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                <Image
                  src={`/api/v1/explore-categories/image/${item.image.url}`}
                  alt={item.image.altText}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  width={96}
                  height={96}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
 