"use client"

import React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Heart, Trash2, Package, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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

// Memoized favorite card component
const FavoriteCard = React.memo<{
  item: FavoriteItem
  onRemove: (item: FavoriteItem) => void
  generateURL: (category: string, subCategory?: string, product?: string, location?: string) => string
}>(({ item, onRemove, generateURL }) => {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = useCallback(async () => {
    setIsRemoving(true)
    try {
      await onRemove(item)
    } finally {
      setIsRemoving(false)
    }
  }, [item, onRemove])

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col justify-between h-full transition-all duration-200 hover:shadow-md hover:border-blue-200">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">{item.name}</h2>
          <Heart className="w-5 h-5 text-red-500 fill-current flex-shrink-0" />
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600 truncate">{item.categorySubType}</p>
          {item.location && <p className="text-xs text-gray-500 truncate">📍 {item.location}</p>}
          <p className="text-lg font-bold text-green-600">₹{item.cPrice.toLocaleString("en-IN")}</p>
        </div>

        {item.description && <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.description}</p>}
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full bg-transparent"
          onClick={handleRemove}
          disabled={isRemoving}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isRemoving ? "Removing..." : "Remove"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 w-full bg-transparent"
          asChild
        >
          <Link href={generateURL(item.categoryType, item.categorySubType, item.name, item.location)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </Button>
      </div>
    </div>
  )
})

const FavouritesComponent: React.FC = () => {
  const [favourites, setFavourites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ email: string; userId: string } | null>(null)

  // Memoized URL generator
  const generateSEOFriendlyURL = useCallback(
    (category: string, subCategory?: string, product?: string, location?: string) => {
      const cleanPart = (part: string | undefined): string => {
        if (!part) return ""
        return part
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      }

      const parts = [category, subCategory, product, location].filter(Boolean).map(cleanPart).filter(Boolean)

      return `/products/${parts.join("/")}`
    },
    [],
  )

  // Memoized cookie getter
  const getCookie = useCallback((name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }, [])

  // Memoized fetch function
  const fetchFavourites = useCallback(async () => {
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
          Authorization: `Bearer ${token}`,
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
  }, [getCookie])

  // Memoized remove handler
  const handleToggleFavorite = useCallback(
    async (item: FavoriteItem) => {
      try {
        const token = getCookie("token")
        if (!token || !userInfo) {
          throw new Error("No authentication token or user info found")
        }

        const response = await fetch(`/api/v1/favourites/save`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
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

        setFavourites((prev) => prev.filter((fav) => fav._id !== item._id))
        toast.success("Removed from favorites")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred while updating favorite"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [userInfo, getCookie],
  )

  // Memoized grid columns calculation
  const gridCols = useMemo(() => {
    const count = favourites.length
    if (count === 0) return "grid-cols-1"
    if (count === 1) return "grid-cols-1"
    if (count === 2) return "grid-cols-1 sm:grid-cols-2"
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }, [favourites.length])

  useEffect(() => {
    fetchFavourites()
  }, [fetchFavourites])

  if (loading) {
    return (
      <div className="max-w-full p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className={`grid ${gridCols} gap-4`}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <Package className="mx-auto mb-3 text-red-400" size={48} />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Favorites</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={fetchFavourites}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Favorite Products</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {favourites.length > 0
            ? `You have ${favourites.length} favorite product${favourites.length === 1 ? "" : "s"}`
            : "Manage your favorite products here"}
        </p>
      </div>

      {favourites.length === 0 ? (
        <div className="text-center py-12 sm:py-20">
          <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 max-w-md mx-auto">
            <Heart className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">No Favorites Yet</h3>
            <p className="text-gray-500 text-sm sm:text-base mb-6">
              Start exploring products and add them to your favorites to see them here.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
          {favourites.map((item) => (
            <FavoriteCard
              key={item._id}
              item={item}
              onRemove={handleToggleFavorite}
              generateURL={generateSEOFriendlyURL}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Add display name for debugging
FavoriteCard.displayName = "FavoriteCard"

export default React.memo(FavouritesComponent)
