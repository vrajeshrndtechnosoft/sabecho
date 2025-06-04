"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Loader2 } from "lucide-react"  
import { cn } from "@/lib/utils"
import { toast } from 'sonner';
import SearchCombobox from "./product-search"

interface Product {
  _id: string
  location: string
  categoryType: string
  categorySubType: string
  name: string
  measurementOptions: string[]
}

// Form schema for validation
const formSchema = z.object({
  product: z.object({
    _id: z.string(),
    location: z.string(),
    categoryType: z.string(),
    categorySubType: z.string(),
    name: z.string(),
    measurementOptions: z.array(z.string()),
  }).nullable().refine((val) => val !== null, {
    message: "Please select a product",
  }),
  quantity: z.number().min(1, "Quantity must be at least 1").int("Quantity must be an integer"),
  measurement: z.string().min(1, "Please select a measurement"),
  specification: z.string().optional(),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  emailAddress: z.string().email("Please enter a valid email address"),
})

type FormData = z.infer<typeof formSchema>

export default function RequirementsForm() {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openMeasurementDropdown, setOpenMeasurementDropdown] = useState(false)

  // Mock search data
  const mockSearchData: Product[] = [
    {
      _id: "1",
      location: "vapi",
      categoryType: "Polymers and Packaging",
      categorySubType: "Premium Boxes",
      name: "Reverse Truck Boxes",
      measurementOptions: ["pieces", "dozens", "boxes"],
    },
    {
      _id: "2",
      location: "vapi",
      categoryType: "Polymers and Packaging",
      categorySubType: "Premium Boxes",
      name: "Kraft Carton boxes",
      measurementOptions: ["pieces", "dozens", "sets"],
    },
    {
      _id: "3",
      location: "vapi",
      categoryType: "Polymers and Packaging",
      categorySubType: "Premium Boxes",
      name: "Cake & Bakery Boxes",
      measurementOptions: ["pieces", "dozens", "packs"],
    },
    {
      _id: "4",
      location: "vapi",
      categoryType: "Polymers and Packaging",
      categorySubType: "Tapes",
      name: "Packing Tapes",
      measurementOptions: ["rolls", "meters", "yards"],
    },
    {
      _id: "5",
      location: "vapi",
      categoryType: "Polymers and Packaging",
      categorySubType: "Tapes",
      name: "Masking Tape",
      measurementOptions: ["rolls", "meters", "feet"],
    },
    {
      _id: "6",
      location: "vapi",
      categoryType: "Tools",
      categorySubType: "Cutting Tools",
      name: "Knives & Scissors",
      measurementOptions: ["pieces", "sets", "pairs"],
    },
    {
      _id: "7",
      location: "vapi",
      categoryType: "Polymers and Packaging",
      categorySubType: "Pouches",
      name: "Zip Lock Pouches",
      measurementOptions: ["pieces", "packs", "dozens"],
    },
    {
      _id: "8",
      location: "vapi",
      categoryType: "Polymers and Packaging",
      categorySubType: "Bags",
      name: "Kraft Paper Bags",
      measurementOptions: ["pieces", "dozens", "bundles"],
    },
  ]

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: null,
      quantity: 1,
      measurement: "",
      specification: "",
      mobileNumber: "",
      emailAddress: "",
    },
  })

  // Search handler for SearchCombobox
  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      return []
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Filter mock data based on search term
    const filteredResults = mockSearchData.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase())
    )
    
    setSearchResults(filteredResults)
    return filteredResults
  }

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const payload = {
        productId: data.product?._id,
        quantity: data.quantity,
        measurement: data.measurement,
        specification: data.specification || "",
        mobileNumber: data.mobileNumber,
        emailAddress: data.emailAddress,
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Form submitted:", payload)
      toast("Success", {
        description: "Your requirements have been submitted successfully!",
      })

      // Reset form after successful submission
      reset()
      setSearchResults([])
    } catch (error) {
      console.error("Error submitting requirements:", error)
      toast("Error", {
        description: "Failed to submit your requirements. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    
      <>
        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Product Name */}
              <Controller
                name="product"
                control={control}
                render={({ field }) => (
                  <SearchCombobox<Product>
                    label="Product Name"
                    placeholder="Select product..."
                    searchPlaceholder="Search products..."
                    data={searchResults}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value)
                      setValue("measurement", "") // Reset measurement when product changes
                    }}
                    onSearch={handleSearch}
                    displayField="name"
                    valueField="_id"
                    error={errors.product?.message}
                  />
                )}
              />

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-md font-medium text-gray-700">Quantity</Label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                      className="h-10"
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="text-md text-red-500">{errors.quantity.message}</p>
                )}
              </div>

              {/* Measurement */}
              <div className="space-y-2">
                <Label className="text-md font-medium text-gray-700">Measurement</Label>
                <Controller
                  name="measurement"
                  control={control}
                  render={({ field }) => (
                    <Popover open={openMeasurementDropdown} onOpenChange={setOpenMeasurementDropdown}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openMeasurementDropdown}
                          className="w-full justify-between h-10 text-left font-normal"
                          disabled={!control._formValues.product}
                        >
                          <span className="truncate">
                            {field.value || (control._formValues.product ? "Select measurement" : "Select product first")}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0" align="start">
                        <Command>
                          <CommandList className="max-h-48">
                            <CommandGroup>
                              {control._formValues.product?.measurementOptions.map((measurement: string) => (
                                <CommandItem
                                  key={measurement}
                                  value={measurement}
                                  onSelect={() => {
                                    field.onChange(measurement)
                                    setOpenMeasurementDropdown(false)
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === measurement ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="capitalize">{measurement}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.measurement && (
                  <p className="text-md text-red-500">{errors.measurement.message}</p>
                )}
              </div>

              {/* Specification */}
              <div className="space-y-2">
                <Label className="text-md font-medium text-gray-700">Specification</Label>
                <Controller
                  name="specification"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={control._formValues.measurement ? `e.g., 1000 ${control._formValues.measurement}` : "Enter specification"}
                      className="h-10"
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mobile Number */}
              <div className="space-y-2">
                <Label className="text-md font-medium text-gray-700">Mobile Number</Label>
                <Controller
                  name="mobileNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="tel"
                      {...field}
                      placeholder="Enter mobile number"
                      className="h-10"
                    />
                  )}
                />
                {errors.mobileNumber && (
                  <p className="text-md text-red-500">{errors.mobileNumber.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label className="text-md font-medium text-gray-700">Email Address</Label>
                <Controller
                  name="emailAddress"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="email"
                      {...field}
                      placeholder="Enter email address"
                      className="h-10"
                    />
                  )}
                />
                {errors.emailAddress && (
                  <p className="text-md text-red-500">{errors.emailAddress.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </div>
        </>
  )
}