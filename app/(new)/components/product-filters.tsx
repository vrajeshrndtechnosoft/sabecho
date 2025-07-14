"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Search } from "lucide-react"

interface Category {
  id: string
  name: string
  count: number
  children?: Category[]
}

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    priceRange: true,
    gsm: true,
    capacity: true,
    printing: true,
  })
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [selectedCapacities, setSelectedCapacities] = useState<number[]>([])
  const [selectedPrinting, setSelectedPrinting] = useState<string[]>([])
  const [gsmSearch, setGsmSearch] = useState("")

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCapacityChange = (capacity: number, checked: boolean) => {
    setSelectedCapacities((prev) => (checked ? [...prev, capacity] : prev.filter((c) => c !== capacity)))
  }

  const handlePrintingChange = (printing: string, checked: boolean) => {
    setSelectedPrinting((prev) => (checked ? [...prev, printing] : prev.filter((p) => p !== printing)))
  }

  return (
    <div className="space-y-4">
      {/* Mobile Filter Header - Only visible in mobile sheet */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <span className="text-sm font-medium text-orange-800">Active Filters</span>
          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-800">
            Clear All
          </Button>
        </div>
      </div>

      {/* Rest of the existing filter components remain the same */}
      {/* Category Filter */}
      <Card>
        <Collapsible open={expandedSections.category} onOpenChange={() => toggleSection("category")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-700">
                CATEGORY
                {expandedSections.category ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-3">
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-orange-600 font-medium cursor-pointer hover:underline">
                        {category.name}
                      </span>
                    </div>
                    {category.children && (
                      <div className="ml-5 space-y-2">
                        {category.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 cursor-pointer hover:text-orange-600">
                              {child.name}
                            </span>
                            <span className="text-xs text-gray-400">({child.count})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <Collapsible open={expandedSections.priceRange} onOpenChange={() => toggleSection("priceRange")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-700">
                PRICE RANGE
                {expandedSections.priceRange ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                <Input
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                  className="text-sm"
                />
                <Input
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                  className="text-sm"
                />
                <Button size="sm" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* GSM Filter */}
      <Card>
        <Collapsible open={expandedSections.gsm} onOpenChange={() => toggleSection("gsm")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-700">
                GSM
                {expandedSections.gsm ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Input
                placeholder="Search GSM"
                value={gsmSearch}
                onChange={(e) => setGsmSearch(e.target.value)}
                className="mb-3 text-sm"
              />
              <div className="flex items-center space-x-2">
                <Checkbox id="gsm-300-255" />
                <Label htmlFor="gsm-300-255" className="text-sm text-gray-600">
                  300 / 255
                </Label>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Capacity Filter */}
      <Card>
        <Collapsible open={expandedSections.capacity} onOpenChange={() => toggleSection("capacity")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-700">
                CAPACITY
                <span className="text-xs text-gray-500">(ML)</span>
                {expandedSections.capacity ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Input placeholder="Search Capacity" className="mb-3 text-sm" />
              <div className="space-y-3">
                {[500, 1000, 750].map((capacity) => (
                  <div key={capacity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`capacity-${capacity}`}
                      checked={selectedCapacities.includes(capacity)}
                      onCheckedChange={(checked) => handleCapacityChange(capacity, checked as boolean)}
                    />
                    <Label htmlFor={`capacity-${capacity}`} className="text-sm text-gray-600">
                      {capacity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Printing Filter */}
      <Card>
        <Collapsible open={expandedSections.printing} onOpenChange={() => toggleSection("printing")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-700">
                PRINTING
                <span className="text-xs text-gray-500">(Pattern)</span>
                {expandedSections.printing ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Input placeholder="Search Printing" className="mb-3 text-sm" />
              <div className="space-y-3">
                {["Plain", "Four Colour Offset Printing", "Single Colour Screen Printing"].map((printing) => (
                  <div key={printing} className="flex items-center space-x-2">
                    <Checkbox
                      id={`printing-${printing.replace(/\s+/g, "-").toLowerCase()}`}
                      checked={selectedPrinting.includes(printing)}
                      onCheckedChange={(checked) => handlePrintingChange(printing, checked as boolean)}
                    />
                    <Label
                      htmlFor={`printing-${printing.replace(/\s+/g, "-").toLowerCase()}`}
                      className="text-sm text-gray-600"
                    >
                      {printing}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      {/* Mobile Apply Button - Only visible in mobile sheet */}
      <div className="md:hidden sticky bottom-0 bg-white border-t p-4 mt-6">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent">
            Reset
          </Button>
          <Button className="flex-1 bg-orange-500 hover:bg-orange-600">Apply Filters</Button>
        </div>
      </div>
    </div>
  )
}
