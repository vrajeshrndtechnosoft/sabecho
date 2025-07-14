import type React from "react"
import type { Metadata } from "next"
import { League_Spartan } from "next/font/google"
import "../../globals.css"
import SabechoNavbar from "@/app/(new)/components/navbar"
import Footer from "../components/footer"

const inter = League_Spartan({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sabecho - Your Trusted Partner",
  description: "Sabecho website with responsive navigation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 pt-48`}> {/* Adjust pt-48 (192px) based on navbar height */}
        <SabechoNavbar />
        {children}
        <Footer/>
      </body>
    </html>
  )
}