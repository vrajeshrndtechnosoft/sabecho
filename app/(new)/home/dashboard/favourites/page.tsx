"use client"

import React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Heart, Trash2, Package, ExternalLink, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <Card className="group hover:shadow-lg transition-all duration-200 border-orange-100 hover:border-orange-300">
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">{item.name}</h2>
              <Heart className="w-5 h-5 text-red-500 fill-current flex-shrink-0" />
            </div>

            <div className="space-y-2 mb-4">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {item.categorySubType}
              </Badge>

              {item.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{item.location}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-green-600">₹{item.cPrice.toLocaleString("en-IN")}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>4.5</span>
                </div>
              </div>
            </div>

            {item.description && <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.description}</p>}
          </div>

          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100">
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
              className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 w-full bg-transparent"
              asChild
            >
              <Link href={generateURL(item.categoryType, item.categorySubType, item.name, item.location)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorite Products</h1>
          <p className="text-gray-600 text-lg">Manage your favorite products here</p>
        </div>
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <Package className="mx-auto mb-4 text-red-400" size={64} />
              <h3 className="text-xl font-semibold text-red-800 mb-3">Error Loading Favorites</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <Button
                onClick={fetchFavourites}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorite Products</h1>
          <p className="text-gray-600 text-lg">Loading your favorite products...</p>
        </div>
        <div className={`grid ${gridCols} gap-6`}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorite Products</h1>
        <p className="text-gray-600 text-lg">
          {favourites.length > 0
            ? `You have ${favourites.length} favorite product${favourites.length === 1 ? "" : "s"}`
            : "Manage your favorite products here"}
        </p>
      </div>

      {favourites.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
              <Heart className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-3">No Favorites Yet</h3>
              <p className="text-gray-500 mb-6">
                Start exploring products and add them to your favorites to see them here.
              </p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid ${gridCols} gap-6`}>
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
