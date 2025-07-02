"use client"

import { useState, useTransition } from "react"
import { usePathname } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { toggleFavoriteAction } from "./server-actions"

interface FavoriteButtonClientProps {
  productName: string
  productId: string
  isFavorite: boolean
}

export default function FavoriteButtonClient({ productName, productId, isFavorite }: FavoriteButtonClientProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite)
  const pathname = usePathname()

  const handleToggleFavorite = () => {
    // Optimistic update for immediate UI feedback
    setOptimisticFavorite(!optimisticFavorite)

    startTransition(async () => {
      const result = await toggleFavoriteAction(productName, productId, pathname)

      if (result.success) {
        toast.success(result.message)
        // The server action handles cache invalidation automatically
      } else {
        // Revert optimistic update on error
        setOptimisticFavorite(optimisticFavorite)
        toast.error(result.message)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isPending}
      className={`p-1 md:p-2 ${
        optimisticFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-500"
      }`}
      aria-label={optimisticFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className="w-4 h-4 md:w-5 md:h-5" fill={optimisticFavorite ? "currentColor" : "none"} />
    </Button>
  )
}
