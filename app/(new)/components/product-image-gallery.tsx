"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductImage {
  id: number
  src: string
  alt: string
  isMain: boolean
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevious()
    } else if (e.key === "ArrowRight") {
      handleNext()
    } else if (e.key === "Escape") {
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div
          className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsDialogOpen(true)}
        >
          <Image
            src={images[selectedImageIndex]?.src || "/placeholder.svg"}
            alt={images[selectedImageIndex]?.alt || productName}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              isHovered && "lg:scale-150 lg:cursor-zoom-in",
            )}
            style={{
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />

          {/* Zoom Button - Mobile/Tablet Only */}
          <Button
            className="absolute bottom-4 right-4 bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 lg:hidden transition-opacity"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsDialogOpen(true)
            }}
            aria-label="Zoom image"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Hover Overlay - Desktop Only */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 hidden lg:block" />
        </div>
      </div>

      {/* Thumbnail Images */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            className={cn(
              "relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all",
              selectedImageIndex === index
                ? "border-orange-500 ring-2 ring-orange-200"
                : "border-gray-200 hover:border-gray-300",
            )}
            onClick={() => setSelectedImageIndex(index)}
            aria-label={`View ${image.alt}`}
          >
            <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>

      {/* Image Dialog - Mobile/Tablet */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black" onKeyDown={handleKeyDown}>
          <DialogHeader className="absolute top-4 left-4 z-10">
            <DialogTitle className="text-white sr-only">Product Image Gallery</DialogTitle>
          </DialogHeader>

          <Button
            className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full"
            size="sm"
            onClick={() => setIsDialogOpen(false)}
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="relative w-full h-full flex items-center justify-center">
            {/* Previous Button */}
            <Button
              className="absolute left-4 z-10 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full disabled:opacity-50"
              onClick={handlePrevious}
              disabled={images.length <= 1}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Main Image */}
            <div className="relative w-full h-full max-w-3xl max-h-[80vh] mx-16">
              <Image
                src={images[selectedImageIndex]?.src || "/placeholder.svg"}
                alt={images[selectedImageIndex]?.alt || productName}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
              />
            </div>

            {/* Next Button */}
            <Button
              className="absolute right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full disabled:opacity-50"
              onClick={handleNext}
              disabled={images.length <= 1}
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>

          {/* Thumbnail Navigation */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-xs overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                className={cn(
                  "relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                  selectedImageIndex === index ? "border-orange-500" : "border-gray-600 hover:border-gray-400",
                )}
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`View ${image.alt}`}
              >
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
