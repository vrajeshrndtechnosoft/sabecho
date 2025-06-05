"use client"

import { useState, useEffect } from "react"
import { Heart, Trash2, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface TokenResponse {
  email: string
  exp: number
  iat: number
  userId: string
  userType: string
}

interface FavoriteItem {
  _id: string
  name: string
  description: string
  image?: string
}

interface ErrorResponse {
  error: string
}

const FavouritesComponent: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get token from cookie
      const token = getCookie("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Verify token
      const tokenResponse = await fetch("https://sabecho.com/api/v1/verifyToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Token verification failed")
      }

      const tokenData: TokenResponse = await tokenResponse.json()
      const userId = tokenData.userId

      // Fetch favorites
      const favoritesResponse = await fetch(`https://sabecho.com/api/v1/favorites/matched/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!favoritesResponse.ok) {
        // Parse the error response
        const errorData: ErrorResponse = await favoritesResponse.json()
        if (favoritesResponse.status === 404 && errorData.error === "Favorites not found") {
          setFavorites([]) // Show "No favorites" UI
          return
        }
        throw new Error(errorData.error || "Failed to fetch favorites")
      }

      const favoritesData: FavoriteItem[] = await favoritesResponse.json()
      setFavorites(favoritesData)

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

      // Mock API call to remove favorite (adjust endpoint as needed)
      const response = await fetch(`https://sabecho.com/api/v1/favorites/remove/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to remove favorite")
      }

      // Update state to remove the item locally
      setFavorites(favorites.filter((item) => item._id !== itemId))

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while removing favorite")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg">Loading favorites...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle size={24} />
          <span className="text-lg">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          My Favorites
        </h1>
        <Label className="font-light text-gray-500 mb-6">
            Manage your favorite items
        </Label>

        {favorites.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <Heart className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg">You haven’t added any favorites yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border p-6 flex flex-col">
                {/* Item Image */}
                <div className="relative h-40 mb-4">
                  {item.image ? (
                    <Image
                      src={`https://sabecho.com/uploads/${item.image}`}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h2>
                <p className="text-sm text-gray-600 flex-1">{item.description}</p>

                {/* Remove Button */}
                <Button
                  variant="outline"
                  className="mt-4 text-red-600 border-red-500 hover:bg-red-50"
                  onClick={() => handleRemoveFavorite(item._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavouritesComponent