"use client"

import { useState, useEffect } from "react"
import { Heart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FavoriteItem {
  _id: string
  name: string
  description: string
  cPrice: number
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

  useEffect(() => {
    fetchFavourites()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      const userId = tokenData.userId

      const favouritesResponse = await fetch(`/api/v1/favourites/matched/${userId}`, {
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

  const handleRemoveFavorite = async (itemId: string) => {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/v1/favourites/save/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to remove favorite")
      }

      setFavourites(favourites.filter((item) => item._id !== itemId))

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while removing favorite")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Favorite Products</h1>

        {favourites.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <Heart className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg">You haven’t added any favourites yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favourites.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border p-4 flex flex-col h-full">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">{item.name}</h2>
                <p className="text-xs text-gray-600 mb-2">{item.categorySubType}</p>
                <p className="text-lg font-bold text-green-600 mb-4">{item.cPrice}</p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-500 hover:bg-red-50 w-full sm:w-auto"
                    onClick={() => handleRemoveFavorite(item._id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Remove
                  </Button>
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-500 hover:bg-blue-50 w-full sm:w-auto"
                    asChild
                  >
                    <Link href={`/products/${item.categorySubType.toLowerCase().replace(/ /g, '-')}/${item.name.toLowerCase().replace(/ /g, '-')}/${item.location.toLowerCase().replace(/ /g, '-')}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavouritesComponent