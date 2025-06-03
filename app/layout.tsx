"use client";

import type React from "react";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import DynamicNavigation from "@/components/dynamic-navigation";
import {Toaster} from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });



// Helper function to check if route should hide navigation/footer
const shouldHideNavigation = (pathname: string): boolean => {
  const protectedPaths = [
    "/admin",
    "/seller",
    "/buyer", 
    "/superadmin",
    "/auth",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
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

        {/* Footer - conditionally rendered */}
        {!shouldHideNavigation(pathname) && (
          <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Sabecho</h3>
                  <p className="text-gray-400 mb-4">
                    India&apos;s most trusted B2B marketplace connecting businesses
                    across the nation.
                  </p>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Facebook
                    </a>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Twitter
                    </a>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Company</h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="/about"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="/careers"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Careers
                      </a>
                    </li>
                    <li>
                      <a
                        href="/blog"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contact"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Services</h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="/services"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        All Services
                      </a>
                    </li>
                    <li>
                      <a
                        href="/services/manufacturing"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Manufacturing
                      </a>
                    </li>
                    <li>
                      <a
                        href="/services/construction"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Construction
                      </a>
                    </li>
                    <li>
                      <a
                        href="/services/technology"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Technology
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Support</h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="/help"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a
                        href="/faq"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        FAQ
                      </a>
                    </li>
                    <li>
                      <a
                        href="/privacy"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="/terms"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Terms of Service
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                <p className="text-gray-400">
                  © 2024 Sabecho. All rights reserved. | Made with ❤️ in India
                </p>
              </div>
            </div>
          </footer>
        )}
      </body>
    </html>
  );
}
