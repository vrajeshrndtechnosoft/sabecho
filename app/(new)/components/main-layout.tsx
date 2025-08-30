"use client"

import type React from "react"
import { useRef } from "react"
import { usePathname } from "next/navigation"
import LayoutHeader from "./layout-header"
import StickyNavbar from "./sticky-navbar"
import Footer from "./footer"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const searchRef = useRef<{ focus: () => void }>(null)
  const pathname = usePathname()

  const handleSearchClick = () => {
    if (searchRef.current) {
      searchRef.current.focus()
    }
  }

  // Define pages where footer should be visible
  const footerPages = ["/home", "/home/about-us", "/home/contact-us"]
  const shouldShowFooter = footerPages.includes(pathname)

  return (
    <div className="min-h-screen flex flex-col">
      <LayoutHeader ref={searchRef} />
      <StickyNavbar onSearchClick={handleSearchClick} />
      <main className="flex-1">{children}</main>
      {shouldShowFooter && <Footer />}
    </div>
  )
}
