"use client"

import { useState, useEffect, useCallback } from "react"
import { Heart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FavoriteItem {
  _id: string
  name: string
  description: string
  cPrice: number
  categoryType: string
  categorySubType: string
  img?: string
  location: string
}

interface TokenResponse {
  email: string
  exp: number
  iat: number
  userId: string
  userType: string
}

interface ErrorResponse {
  error: string
}

const FavouritesComponent: React.FC = () => {
  const [favourites, setFavourites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ email: string; userId: string } | null>(null)

  const generateSEOFriendlyURL = useCallback(
    (category: string, subCategory?: string, product?: string, location?: string) => {
      const cleanPart = (part: string | undefined): string => {
        if (!part) return ''
        return part
          .toLowerCase()
          .replace(/&/g, 'and') // Replace & with 'and'
          .replace(/[^a-z0-9\s]/g, '') // Remove other special characters except spaces
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      }
      
      const parts = [category, subCategory, product, location]
        .filter(Boolean)
        .map(cleanPart)
        .filter(Boolean) // Remove any empty strings after cleaning
        
      return `/products/${parts.join("/")}`
    },
    []
  )
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }

  const fetchFavourites = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getCookie("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const tokenResponse = await fetch(`/api/v1/auth/verifyToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Token verification failed")
      }

      const tokenData: TokenResponse = await tokenResponse.json()
      setUserInfo({ email: tokenData.email, userId: tokenData.userId })

      const favouritesResponse = await fetch(`/api/v1/favourites/matched/${tokenData.userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!favouritesResponse.ok) {
        const errorData: ErrorResponse = await favouritesResponse.json()
        if (favouritesResponse.status === 404 && errorData.error === "favourites not found") {
          setFavourites([])
          return
        }
        throw new Error(errorData.error || "Failed to fetch favourites")
      }

      const favouritesData: FavoriteItem[] = await favouritesResponse.json()
      setFavourites(favouritesData)

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (item: FavoriteItem) => {
    try {
      const token = getCookie("token")
      if (!token || !userInfo) {
        throw new Error("No authentication token or user info found")
      }

      const isFavorite = favourites.some((fav) => fav._id === item._id)

      if (isFavorite) {
        const response = await fetch(`/api/v1/favourites/save`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userInfo.email,
            productName: item.name,
            userInfo,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to remove favorite")
        }

        setFavourites(favourites.filter((fav) => fav._id !== item._id))
      } else {
        const payload = {
          email: userInfo.email,
          productName: item.name,
          userId: userInfo.userId,
        }

        const response = await fetch(`/api/v1/favourites/save`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error("Failed to add favorite")
        }

        const newFavorite: FavoriteItem = await response.json()
        setFavourites([...favourites, newFavorite])
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating favorite")
    }
  }

  useEffect(() => {
    fetchFavourites()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-4">{error}</div>
  }

 return (
  <div className="max-w-full px-4 py-6 lg:px-8">
    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Favorite Products</h1>

    {favourites.length === 0 ? (
      <div className="text-center py-10">
        <Heart className="mx-auto mb-3 text-gray-400" size={36} />
        <p className="text-sm sm:text-base">You haven&apos;t added any favourites yet.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {favourites.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-base font-semibold text-gray-900">{item.name}</h2>
              <p className="text-sm text-gray-600">{item.categorySubType}</p>
              <p className="text-lg font-bold text-green-600 mt-2">{item.cPrice}</p>
            </div>
            <div className="flex flex-col mt-4 space-y-2">
              <Button
                variant="outline"
                className="text-red-600 border-none hover:bg-red-50 w-full"
                onClick={() => handleToggleFavorite(item)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Remove
              </Button>
              <Button
                variant="outline"
                className="text-blue-600 border-none hover:bg-blue-50 w-full"
                asChild
              >
                <Link
                  href={generateSEOFriendlyURL(
                    item.categoryType,
                    item.categorySubType,
                    item.name,
                    item.location
                  )}
                >
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)};


export default FavouritesComponent