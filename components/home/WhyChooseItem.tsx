"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import Image from "next/image"

interface WhyChooseItem {
  _id: string
  userType: "Buyer" | "seller"
  image: string
  imageAlt: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  createdAt: string
  updatedAt: string
}

export default function WhyChooseSection() {
  const [items, setItems] = useState<WhyChooseItem[]>([])
  const [selectedUserType, setSelectedUserType] = useState<"Buyer" | "seller">("Buyer")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWhyChooseData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("https://sabecho.com/api/v1/why-choose", {
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch Why Choose data")
      }
      const data: WhyChooseItem[] = await response.json()
      setItems(data)
    } catch (err) {
      setError("Unable to load Why Choose information. Please try again later.")
      console.error("Error fetching Why Choose data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWhyChooseData()
  }, [])

  const filteredItems = items.filter((item) => item.userType === selectedUserType)

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50" aria-labelledby="why-choose-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h2
            id="why-choose-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Why Choose Sabecho?
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the benefits tailored for {selectedUserType === "Buyer" ? "buyers" : "sellers"} to grow and succeed with Sabecho.
          </p>
        </header>

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

        {error && (
          <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-red-600 hover:text-red-800"
                onClick={fetchWhyChooseData}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none shadow-lg">
                <CardHeader className="flex justify-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </CardHeader>
                <CardContent className="text-center">
                  <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
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
                      src={`https://sabecho.com/api/v1/explore-categories/image/${item.image}`}
                      alt={item.imageAlt}
                      width={48}
                      height={48}
                      loading="lazy"
                    />
                  )}
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle
                    id={`benefit-title-${item._id}`}
                    className="text-lg font-semibold text-gray-900 mb-2"
                  >
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}