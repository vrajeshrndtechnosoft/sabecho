import { Suspense } from "react";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { cache } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import AboutUs to enable code splitting
const AboutUs = dynamic(() => import("@/components/Aboutus"), {
  ssr: true, // Enable server-side rendering for the component
  loading: () => (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="w-full h-96 mb-8" />
      <div className="space-y-12">
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
      </div>
    </div>
  ),
});

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

// Cache the data fetching
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

// Metadata generation
export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.BASE_URL}/api/v1/metadata?slug=about`, {
      next: { revalidate: 3600 },
    });
    const [meta] = await res.json();

    return {
      title: {
        default: meta?.title ?? "About Us | Sabecho.com",
        template: "%s | Sabecho.com",
      },
      description: meta?.description,
      keywords: meta?.keywords,
      openGraph: {
        title: meta?.title,
        description: meta?.description,
        images: [{ url: meta?.image }],
        url: meta?.canonicalUrl ?? `${process.env.BASE_URL}/about`,
        siteName: "Sabecho",
        type: "website",
        locale: "en_IN",
      },
      twitter: {
        card: "summary_large_image",
        title: meta?.title,
        description: meta?.description,
        images: [meta?.image],
      },
      alternates: {
        canonical: meta?.canonicalUrl ?? `${process.env.BASE_URL}/about`,
      },
    };
  } catch (err) {
    console.error("❌ Metadata load failed:", err);
    return {
      title: "About Us | Sabecho.com",
      description: "India's trusted B2B marketplace for Raw Materials, Packaging Materials & more.",
    };
  }
}

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
      <AboutUs data={data} />
    </Suspense>
  );
}