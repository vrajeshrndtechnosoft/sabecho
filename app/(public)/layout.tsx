import type React from "react";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import ClientNavigation from "@/components/navbar/client-navigation";
import { Toaster } from "@/components/ui/sonner";
import { initializeSitemapCron } from '@/lib/cron/sitemapCron';
import { Metadata } from "next";
import { Providers } from '@/lib/store/providers';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.BASE_URL}/api/v1/metadata?slug=home`);

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
      icons: {
        icon: './favicon.ico'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize cron job only in production and on server
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    initializeSitemapCron();
  }
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientNavigation />
        <Providers>
        <main className="min-h-screen">{children}</main>
        </Providers><Toaster />
      </body>
    </html>
  );
}