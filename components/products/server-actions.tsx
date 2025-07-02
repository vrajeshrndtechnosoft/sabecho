"use server"

import { cookies } from "next/headers"
import { revalidatePath, revalidateTag } from "next/cache"

export async function toggleFavoriteAction(productName: string, productId: string, currentPath: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return { success: false, message: "Please log in to manage favorites" }
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1]))
    const userId = decodedToken.userId
    const email = decodedToken.email

    if (!userId || !email) {
      return { success: false, message: "Invalid user session" }
    }

    const baseUrl = process.env.BASE_URL
    const response = await fetch(`${baseUrl}/api/v1/favourites/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        productName,
        userId,
      }),
    })

    if (!response.ok) {
      return { success: false, message: "Failed to update favorites" }
    }

    // Smart cache invalidation - only invalidate what's needed
    revalidateTag("favorites") // Invalidate all favorites cache
    revalidateTag(`user-${userId}`) // Invalidate specific user's cache
    revalidatePath(currentPath) // Invalidate current page
    revalidatePath("/products") // Invalidate products listing

    return { success: true, message: "Favorites updated successfully" }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return { success: false, message: "An error occurred" }
  }
}

// Action to refresh specific cache tags
export async function refreshProductData(category?: string) {
  if (category) {
    revalidateTag(`category-${category}`)
  } else {
    revalidateTag("products")
  }
  revalidateTag("categories")
}
