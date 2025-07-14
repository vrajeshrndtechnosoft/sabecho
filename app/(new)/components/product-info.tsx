"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, ShoppingCart } from "lucide-react"

interface ProductInfoProps {
  name: string
  price: number
  printingOptions: string[]
  specifications: {
    capacity: string
    material: string
    gsm: string
    type: string
    features: string[]
  }
}

export function ProductInfo({ name, price, printingOptions, specifications }: ProductInfoProps) {
  const [pincode, setPincode] = useState("")
  const [selectedPrinting, setSelectedPrinting] = useState("")
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    console.log("Added to cart:", { name, price, quantity, printing: selectedPrinting })
  }

  const handlePincodeCheck = () => {
    console.log("Checking delivery for pincode:", pincode)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{name}</h1>
        <p className="text-2xl font-bold text-orange-600">₹ {price.toFixed(2)} / Piece</p>
      </div>

      {/* Pincode Checker */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Enter Pincode</span>
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter pincode to check product delivery availability in your area."
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handlePincodeCheck} className="bg-orange-500 hover:bg-orange-600 text-white px-6">
            Check
          </Button>
        </div>
      </div>

      {/* Printing Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Printing
          <span className="text-xs text-gray-500 ml-1">(Pattern)</span>
        </label>
        <Select value={selectedPrinting} onValueChange={setSelectedPrinting}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select printing option" />
          </SelectTrigger>
          <SelectContent>
            {printingOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Quantity</label>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="px-4 py-2 border rounded-md min-w-[60px] text-center">{quantity}</span>
          <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
            +
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-medium"
        size="lg"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Add to Cart
      </Button>

      {/* Product Specifications */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Capacity:</span>
            <span className="ml-2 font-medium">{specifications.capacity}</span>
          </div>
          <div>
            <span className="text-gray-600">Material:</span>
            <span className="ml-2 font-medium">{specifications.material}</span>
          </div>
          <div>
            <span className="text-gray-600">GSM:</span>
            <span className="ml-2 font-medium">{specifications.gsm}</span>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium">{specifications.type}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
