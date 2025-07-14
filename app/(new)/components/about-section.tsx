import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface AboutUsImage {
  image: {
    url: string;
    altText: string;
  };
  title: string;
  description: string;
  _id: string;
}

interface AboutUsData {
  _id: string;
  title: string;
  description: string;
  listOfImages: AboutUsImage[];
  createdAt: string;
  updatedAt: string;
}

interface AboutUsSectionProps {
  aboutUsData: AboutUsData | null;
}

export default function AboutUsSection({ aboutUsData }: AboutUsSectionProps) {
  if (!aboutUsData) {
    return (
      <div
        className="container mx-auto px-4 py-24"
        style={{
          background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
        }}
      >
        <p className="text-center text-gray-600 text-lg">No About Us information available at this time.</p>
      </div>
    );
  }

  return (
    <div
      className="py-24"
      style={{
        background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 relative"
          >
            {aboutUsData.title}
            <span className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gray-500 rounded-full"></span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            {aboutUsData.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {aboutUsData.listOfImages.map((item) => (
            <Card
              key={item._id}
              className="border border-gray-200 shadow-md hover:shadow-xl hover:border-gray-400 transition-all duration-300 overflow-hidden group hover:scale-[1.02]"
            >
              <CardContent className="p-6 text-center flex flex-col items-center">
                <div className="w-32 h-32 rounded-full mb-6 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <Image
                    src={`/api/v1/explore-categories/image/${item.image.url}`}
                    alt={item.image.altText}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={128}
                    height={128}
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}