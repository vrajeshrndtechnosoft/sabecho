"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface AboutUsImage {
  image: {
    url: string
    altText: string
  }
  title: string
  description: string
  _id: string
}

interface AboutUsData {
  _id: string
  title: string
  description: string
  listOfImages: AboutUsImage[]
  createdAt: string
  updatedAt: string
}

export default function AboutUsSection() {
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchAboutUsData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/about-us`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch About Us data")
      }
      const data: AboutUsData[] = await response.json()
      setAboutUsData(data[0] || null) // Take the first item since API returns an array
    } catch (err) {
      setError("Unable to load About Us information. Please try again later.")
      console.error("Error fetching About Us data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAboutUsData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
    <div className="container mx-auto px-4 py-20">
      {isLoading ? (
        <div>
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="text-center border-none shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
                  <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-red-600 hover:text-red-800"
              onClick={fetchAboutUsData}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : !aboutUsData ? (
        <p className="text-center text-gray-600">No About Us information available at this time.</p>
      ) : (
        <div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {aboutUsData.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {aboutUsData.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {aboutUsData.listOfImages.map((item) => (
              <Card
                key={item._id}
                className="text-center hover:shadow-lg transition-all duration-300 group hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                    <Image
                      src={`/api/v1/explore-categories/image/${item.image.url}`}
                      alt={item.image.altText}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      width={96}
                      height={96}
                      onError={(e) => {
                        console.error(`Failed to load image: ${e.currentTarget.src}`)
                        e.currentTarget.src = "/fallback-image.webp"
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  )
}