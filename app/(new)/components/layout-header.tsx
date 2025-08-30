"use client"

import React, { useRef, forwardRef, useImperativeHandle } from "react"
import { Phone, MapPin, Truck, Briefcase, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import LoginButton from "./login-button"
import NavbarSearch from "./navbar-search"

// 👇 define the type for methods exposed to parent
export type LayoutHeaderRef = {
  focus: () => void
}

type LayoutHeaderProps = object

const LayoutHeader = forwardRef<LayoutHeaderRef, LayoutHeaderProps>((_, ref) => {
  const searchRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (searchRef.current) {
        searchRef.current.focus()
        searchRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    },
  }))

  const topBarLinks = [
    { icon: <MapPin className="w-4 h-4" />, text: "Vendor Registration", href: "#" },
    { icon: <Truck className="w-4 h-4" />, text: "Logistic Partner", href: "#" },
    { icon: <Briefcase className="w-4 h-4" />, text: "Career With US", href: "#" },
    { icon: <User className="w-4 h-4" />, text: "Dealership Request", href: "#" },
  ]

  return (
    <div className="bg-white">
      {/* Top Bar */}
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
              <LoginButton className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Logo and Search Section */}
      <div className="py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
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
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-0 flex-1 max-w-xl mx-6">
              <div className="w-full">
                <NavbarSearch ref={searchRef} placeholder="Search Products, Length, Height, Width and more..." />
              </div>
            </div>

            {/* Mobile Search Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <Search className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

LayoutHeader.displayName = "LayoutHeader"
export default LayoutHeader
