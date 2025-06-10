"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AboutUsData {
  whoWeAre: {
    title: string
    description: string
    images: string[]
  }
  ourValues: {
    title: string
    description: string
    values: { icon: string; title: string; _id: string }[]
  }
  ourJourney: {
    title: string
    description: string
    milestones: { icon: string; description: string; year: string; _id: string }[]
  }
  awardsAndAchievements: {
    title: string
    awards: { image: string; title: string; _id: string }[]
  }
  headerImage: string
}

export default function AboutUs() {
  const [data, setData] = useState<AboutUsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_URL = process.env.API_URL || "http://localhost:3033"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/about-us`)
        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }
        const result = await response.json()
        setData(result)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err:unknown) {
        setError("Failed to load content. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [API_URL])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="w-full h-96 mb-8" />
        <div className="space-y-12">
          <Skeleton className="w-full h-64" />
          <Skeleton className="w-full h-64" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error || "No data available"}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {data.headerImage && (
        <div className="relative w-full h-96 mb-8">
          <Image
            src={`${API_URL}/api/v1/explore-categories/image/${data.headerImage}`}
            alt="Header"
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>
      )}

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-blue-600">
            {data.whoWeAre.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6">{data.whoWeAre.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.whoWeAre.images.map((image, index) => (
              <div key={index} className="relative h-64">
                <Image
                  src={`${API_URL}/api/v1/explore-categories/image/${image}`}
                  alt={`About us image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.ourValues.values.length > 0 && data.ourValues.values[0].title && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-blue-600">
              {data.ourValues.title || "Our Values"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.ourValues.description && (
              <p className="text-gray-700 mb-6">{data.ourValues.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.ourValues.values.map((value) => (
                <div key={value._id} className="flex items-start space-x-4">
                  {value.icon && (
                    <Image
                      src={`${API_URL}/api/v1/explore-categories/image/${value.icon}`}
                      alt={value.title}
                      width={40}
                      height={40}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{value.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.ourJourney.milestones.length > 0 && data.ourJourney.milestones[0].description && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-blue-600">
              {data.ourJourney.title || "Our Journey"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.ourJourney.description && (
              <p className="text-gray-700 mb-6">{data.ourJourney.description}</p>
            )}
            <div className="space-y-6">
              {data.ourJourney.milestones.map((milestone) => (
                <div key={milestone._id} className="flex items-start space-x-4">
                  {milestone.icon && (
                    <Image
                      src={`${API_URL}/api/v1/explore-categories/image/${milestone.icon}`}
                      alt={`Milestone ${milestone.year}`}
                      width={40}
                      height={40}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{milestone.year}</h3>
                    <p className="text-gray-700">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.awardsAndAchievements.awards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-blue-600">
              {data.awardsAndAchievements.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.awardsAndAchievements.awards.map((award) => (
                <div key={award._id} className="text-center">
                  <div className="relative h-48 w-full mb-4">
                    <Image
                      src={`${API_URL}/api/v1/explore-categories/image/${award.image}`}
                      alt={award.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{award.title}</h3>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}