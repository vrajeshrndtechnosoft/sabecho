import { cache, Suspense } from "react";
import AboutUsSection from "../../components/about-us"
import { Skeleton } from "@/components/ui/skeleton";

// Define interfaces
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

const fetchAboutUsData = cache(async () => {
  const response = await fetch(`${process.env.BASE_URL}/api/v1/about`, {
    next: { revalidate: 3600 }, // Revalidate every hour
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch about us data");
  }
  return response.json() as Promise<AboutUsData>;
});

export default async function AboutPage() {
  const data = await fetchAboutUsData();  

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="w-full h-96 mb-8" />
          <div className="space-y-12">
            <Skeleton className="w-full h-64" />
            <Skeleton className="w-full h-64" />
            <Skeleton className="w-full h-64" />
          </div>
        </div>
      }
    >
      <AboutUsSection data={data} />
    </Suspense>
  );
}