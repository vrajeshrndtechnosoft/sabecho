"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FavouriteButtonProps {
  productId: string;
  productName: string;
  userId?: string;
  userEmail?: string;
  isAuthenticated: boolean;
  isFavourited: boolean;
  onToggleFavourite: (productId: string) => void;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({
  productId,
  productName,
  userId,
  userEmail,
  isAuthenticated,
  isFavourited,
  onToggleFavourite,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = process.env.API_URL || "http://localhost:3033";

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const handleFavouriteToggle = async () => {
    if (!isAuthenticated || !userId || !userEmail) {
      toast.error("Login Required", {
        description: "Please log in to add items to your favorites.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = getCookie("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_URL}/api/v1/favorite/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          productId,
          productName,
          email: userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to toggle favorite");
      }

      onToggleFavourite(productId);
      toast.success(isFavourited ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update favorites. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleFavouriteToggle}
      disabled={isLoading}
      className={`${
        isFavourited
          ? "text-red-600 border-red-600 hover:bg-red-50"
          : "text-gray-600 border-gray-300 hover:bg-gray-50"
      } h-8 w-8 p-0`}
      aria-label={isFavourited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`w-4 h-4 ${isFavourited ? "fill-current" : ""}`} />
    </Button>
  );
};

export default FavouriteButton;