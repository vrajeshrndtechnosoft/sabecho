"use client";

import type React from "react";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "@/app/globals.css";
import DynamicNavigation from "@/components/dynamic-navigation";
import {Toaster} from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });



// Helper function to check if route should hide navigation/footer
const shouldHideNavigation = (pathname: string): boolean => {
  const protectedPaths = [
   "/admin"
  ];

  return protectedPaths.some((path) => pathname.startsWith(path));
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className={inter.className}>
        {!shouldHideNavigation(pathname) && <DynamicNavigation /> }
        <main className="min-h-screen">
          {children}</main>
        <Toaster />
      </body>
    </html>
  );
}
