"use client";

import { useState, useEffect } from "react";
import { Menu, Search, User, Phone, MapPin, Truck, Briefcase, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ProductDialog from "./product-dialog"; // Adjust the import path as needed

export default function SabechoNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const updateNavbarHeight = () => {
      const navbar = document.querySelector("nav");
      if (navbar) {
        setNavbarHeight(navbar.getBoundingClientRect().height);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateNavbarHeight);
    updateNavbarHeight();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateNavbarHeight);
    };
  }, []);

  useEffect(() => {
    document.body.style.paddingTop = `${navbarHeight}px`;
    return () => {
      document.body.style.paddingTop = "0";
    };
  }, [navbarHeight]);

  const navigationLinks = [
    { name: "Home", href: "/home" },
    { name: "About us", href: "/home/about-us" },
    { name: "Contact us", href: "/home/contact-us" },
    { name: "Get Quotation", href: "/home/buolk-order" },
    { name: "Blog", href: "/home/blog" },
    { name: "Download Brochure", href: "/home" },
  ];

  const topBarLinks = [
    { icon: <MapPin className="w-4 h-4" />, text: "Vendor Registration", href: "#" },
    { icon: <Truck className="w-4 h-4" />, text: "Logistic Partner", href: "#" },
    { icon: <Briefcase className="w-4 h-4" />, text: "Career With US", href: "#" },
    { icon: <User className="w-4 h-4" />, text: "Dealership Request", href: "#" },
    { icon: <LogIn className="w-4 h-4" />, text: "Login / Register", href: "#" },
  ];

  const getActiveLink = () => {
    return navigationLinks.find((link) => link.href === pathname) ? pathname : null;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
      style={{ height: navbarHeight ? `${navbarHeight}px` : "auto" }}
    >
      {/* Top Bar - Hidden when scrolled */}
      <div
        className={`transition-all duration-300 ${isScrolled ? "h-0 overflow-hidden opacity-0" : "h-auto opacity-100"}`}
      >
        <div className="bg-gray-900 text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">Toll-Free :</span>
                <Link href="tel:18001238911" className="hover:text-yellow-300 transition-colors">
                  1800 123 8911
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                {topBarLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
                  >
                    {link.icon}
                    <span>{link.text}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo and Search Section */}
      <div
        className={`bg-white transition-all duration-300 ${
          isScrolled ? "h-0 overflow-hidden opacity-0" : "h-auto opacity-100 py-6"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative w-32 h-32 sm:w-24 sm:h-24 md:w-16 md:h-16">
                <Image
                  src="/1724491961010-11045627.png"
                  alt="Sabecho Logo"
                  fill
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 96px, 64px"
                  className="object-contain rounded-full border-2 border-gray-300 bg-gray-900"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </div>

            {/* Search Bar with Dialog */}
            <div className="hidden md:flex items-center space-x-0 flex-1 max-w-xl mx-6">
              <ProductDialog />
              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder="Search Products, Length, Height, Width and more..."
                  className="rounded-l-none rounded-r-none border-l-0 border-r-0 focus:ring-0 focus:border-gray-300"
                />
              </div>
              <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-l-none px-4">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-8 h-8" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="flex items-center">
                      <div className="relative w-32 h-32">
                        <Image
                          src="/1724491961010-11045627.png"
                          alt="Sabecho Logo"
                          fill
                          sizes="128px"
                          className="object-contain rounded-full border-2 border-gray-300"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                    </div>

                    {navigationLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`text-lg font-medium py-2 transition-colors ${
                          getActiveLink() === link.href ? "text-orange-500" : "hover:text-orange-500"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}

                    <div className="border-t pt-4 mt-6">
                      <div className="space-y-3">
                        <Link
                          href="tel:18001238911"
                          className="flex items-center space-x-3 text-sm hover:text-orange-500 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Toll-Free : 1800 123 8911</span>
                        </Link>
                        {topBarLinks.map((link, index) => (
                          <Link
                            key={index}
                            href={link.href}
                            className="flex items-center space-x-3 text-sm hover:text-orange-500 transition-colors"
                          >
                            {link.icon}
                            <span>{link.text}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${isScrolled ? "py-3" : "py-3"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Categories Button and Logo (when scrolled) */}
            <div className="flex items-center space-x-6">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 border border-gray-600">
                <Menu className="w-4 h-4 mr-2" />
                CATEGORIES
              </Button>

              {isScrolled && (
                <div className="flex items-center">
                  <div className="relative w-16 h-16">
                    <Image
                      src="/1724491961010-11045627.png"
                      alt="Sabecho Logo"
                      fill
                      sizes="(max-width: 640px) 64px, 64px"
                      className="object-contain"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-medium transition-colors ${
                    getActiveLink() === link.href ? "text-orange-500" : "text-white hover:text-orange-400"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button (when scrolled) */}
            {isScrolled && (
              <div className="lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <div className="flex flex-col space-y-4 mt-8">
                      <div className="flex items-center">
                        <div className="relative w-32 h-32">
                          <Image
                            src="/1724491961010-11045627.png"
                            alt="Sabecho Logo"
                            fill
                            sizes="128px"
                            className="object-contain rounded-full border-2 border-gray-300"
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        </div>
                      </div>

                      {navigationLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className={`text-lg font-medium py-2 transition-colors ${
                            getActiveLink() === link.href ? "text-orange-500" : "hover:text-orange-500"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}