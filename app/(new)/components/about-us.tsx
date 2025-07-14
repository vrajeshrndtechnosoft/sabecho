import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AboutUsData {
  whoWeAre: {
    title: string;
    description: string;
    images: string[];
  };
  ourValues: {
    title: string;
    description: string;
    values: { icon: string; title: string; _id: string }[];
  };
  ourJourney: {
    title: string;
    description: string;
    milestones: { icon: string; description: string; year: string; _id: string }[];
  };
  awardsAndAchievements: {
    title: string;
    awards: { image: string; title: string; _id: string }[];
  };
  headerImage: string;
}

interface AboutUsProps {
  data: AboutUsData | null;
}

export default function AboutUs({ data }: AboutUsProps) {
  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Failed to load content. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-7 min-h-screen">
      {data.headerImage && (
        <div className="relative w-full h-[24rem] sm:h-[32rem] mb-8">
          <Image
            src={`/api/v1/explore-categories/image/${data.headerImage}`}
            alt="Header"
            fill
            sizes="100vw"
            className="object-cover rounded-lg"
            priority
            quality={75}
          />
        </div>
      )}

      <Card className="mb-12 border-t-4 border-orange-500">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-orange-600">
            {data.whoWeAre.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">{data.whoWeAre.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.whoWeAre.images.map((image, index) => (
              <div key={index} className="relative h-48 sm:h-64">
                <Image
                  src={`/api/v1/explore-categories/image/${image}`}
                  alt={`About us image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover rounded-lg"
                  loading="lazy"
                  quality={75}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.ourValues.values.length > 0 && data.ourValues.values[0].title && (
        <Card className="mb-12 border-t-4 border-orange-500">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-orange-600">
              {data.ourValues.title || "Our Values"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.ourValues.description && (
              <p className="text-gray-700 mb-6 text-sm sm:text-base">{data.ourValues.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.ourValues.values.map((value) => (
                <div key={value._id} className="flex items-start space-x-4">
                  {value.icon && (
                    <Image
                      src={`/api/v1/explore-categories/image/${value.icon}`}
                      alt={value.title}
                      width={40}
                      height={40}
                      sizes="40px"
                      loading="lazy"
                      quality={75}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{value.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.ourJourney.milestones.length > 0 && data.ourJourney.milestones[0].description && (
        <Card className="mb-12 border-t-4 border-orange-500">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-orange-600">
              {data.ourJourney.title || "Our Journey"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.ourJourney.description && (
              <p className="text-gray-700 mb-6 text-sm sm:text-base">{data.ourJourney.description}</p>
            )}
            <div className="space-y-6">
              {data.ourJourney.milestones.map((milestone) => (
                <div key={milestone._id} className="flex items-start space-x-4">
                  {milestone.icon && (
                    <Image
                      src={`/api/v1/explore-categories/image/${milestone.icon}`}
                      alt={`Milestone ${milestone.year}`}
                      width={40}
                      height={40}
                      sizes="40px"
                      loading="lazy"
                      quality={75}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{milestone.year}</h3>
                    <p className="text-gray-700 text-sm sm:text-base">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.awardsAndAchievements.awards.length > 0 && (
        <Card className="border-t-4 border-orange-500">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-orange-600">
              {data.awardsAndAchievements.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.awardsAndAchievements.awards.map((award) => (
                <div key={award._id} className="text-center">
                  <div className="relative h-32 sm:h-48 w-full mb-4">
                    <Image
                      src={`/api/v1/explore-categories/image/${award.image}`}
                      alt={award.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg">{award.title}</h3>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}