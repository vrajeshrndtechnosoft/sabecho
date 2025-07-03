import NegotiationForm from "@/components/orders/negotation-form"
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.BASE_URL}/api/v1/metadata?slug=negotiation`,);

    const [meta] = await res.json();

    return {
      title: {
        default: meta?.title ?? "Home | Sabecho.com",
        template: "%s | Sabecho.com",
      },
      description: meta?.description,
      keywords: meta?.keywords,
      openGraph: {
        title: meta?.title,
        description: meta?.description,
        images: [{ url: meta?.image }],
        url: meta?.canonicalUrl ?? `${process.env.BASE_URL}`,
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
        canonical: meta?.canonicalUrl ?? `${process.env.BASE_URL}`,
      },
    };
  } catch (err) {
    console.error("❌ Metadata load failed:", err);
    return {
      title: "Sabecho.com | India's #1 B2B Marketplace",
      description: "India's trusted B2B marketplace for steel, electronics, textiles & more.",
    };
  }
}

export default function Page() {
  return (
    <>
      <NegotiationForm/>
    </>
  )
}
