"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { WhyChoose } from "@/models/home/WhyChoose"

interface WhyChooseClientProps {
  whyChooseData: WhyChoose[]
}

export function WhyChooseClient({ whyChooseData }: WhyChooseClientProps) {
  const [selectedUserType, setSelectedUserType] = useState<"Buyer" | "seller">("Buyer")

  const filteredItems = whyChooseData.filter((item) => item.userType === selectedUserType)

  return (
    <>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-10">
        Discover the benefits tailored for {selectedUserType === "Buyer" ? "buyers" : "sellers"} to grow and succeed
        with Sabecho.
      </p>
      {/* Toggle Buttons */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-full border border-gray-200 p-1 bg-white shadow-sm">
          <Button
            variant={selectedUserType === "Buyer" ? "default" : "ghost"}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors duration-200 ${
              selectedUserType === "Buyer"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedUserType("Buyer")}
            aria-pressed={selectedUserType === "Buyer"}
            aria-label="View benefits for Buyers"
          >
            For Buyers
          </Button>
          <Button
            variant={selectedUserType === "seller" ? "default" : "ghost"}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors duration-200 ${
              selectedUserType === "seller"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedUserType("seller")}
            aria-pressed={selectedUserType === "seller"}
            aria-label="View benefits for Sellers"
          >
            For Sellers
          </Button>
        </div>
      </div>
      {filteredItems.length === 0 ? (
        <p className="text-center text-gray-600">
          No benefits available for {selectedUserType === "Buyer" ? "buyers" : "sellers"} at this time.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item._id}
              className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300"
              aria-labelledby={`benefit-title-${item._id}`}
            >
              <CardHeader className="flex justify-center">
                {item.image && (
                  <Image
                    src={`/api/v1/explore-categories/image/${item.image}`}
                    alt={item.imageAlt}
                    width={48}
                    height={48}
                    loading="lazy"
                  />
                )}
              </CardHeader>
              <CardContent className="text-center">
                <CardTitle id={`benefit-title-${item._id}`} className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
