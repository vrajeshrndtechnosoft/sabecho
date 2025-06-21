import type React from "react";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import ClientNavigation from "@/components/client-navigation";
import { Toaster } from "@/components/ui/sonner";
import { initializeSitemapCron } from '@/lib/cron/sitemapCron';

const inter = Inter({ subsets: ["latin"] });

// Metadata for SEO and social sharing
export const metadata = {
  title: {
    default: "Sabecho.com | India's #1 B2B Marketplace",
    template: "%s | Sabecho.com",
  },
  description: "Sabecho is India's trusted B2B marketplace, connecting 50,000+ businesses for seamless trading of steel, electronics, textiles, and more.",
  keywords: ["B2B marketplace", "India B2B platform", "business trading", "Sabecho", "buy sell products"],
  openGraph: {
    title: "Sabecho.com | India's #1 B2B Marketplace",
    description: "Join 50,000+ businesses on Sabecho for seamless B2B trading. Find suppliers, get quotes, and grow your business.",
    url: "https://sabecho.com",
    siteName: "Sabecho",
    images: [
      {
        url: "https://sabecho.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sabecho B2B Marketplace",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabecho.com | India's #1 B2B Marketplace",
    description: "Join 50,000+ businesses on Sabecho, India's trusted B2B marketplace for trading steel, electronics, textiles, and more.",
    images: ["https://sabecho.com/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://sabecho.com",
  },
};

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
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}