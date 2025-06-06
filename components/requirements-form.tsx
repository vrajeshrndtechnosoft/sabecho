"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface RequirementsFormProps {
  initialProduct?: Product | null
}

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper function to check if user is logged in
const isUserLoggedIn = (): boolean => {
  const token = getCookie('token');
  const userType = getCookie('usertype');
  return !!(token && userType);
}

// Dynamic form schema based on login status
const createFormSchema = (isLoggedIn: boolean) => {
  const baseSchema = {
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
  };

  if (!isLoggedIn) {
    return z.object({
      ...baseSchema,
      emailAddress: z.string().email("Please enter a valid email address"),
      mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
    });
  }

  return z.object(baseSchema);
}

export default function RequirementsForm({ initialProduct = null }: RequirementsFormProps) {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openMeasurementDropdown, setOpenMeasurementDropdown] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check login status on component mount and update
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = isUserLoggedIn()
      console.log('Login status:', loginStatus) // Debug log
      setIsLoggedIn(loginStatus)
    }
    
    checkLoginStatus()
    
    // Also check on cookie changes (optional)
    const interval = setInterval(checkLoginStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  // Create form schema based on login status
  const formSchema = createFormSchema(isLoggedIn)
  type FormData = z.infer<typeof formSchema>

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
  const defaultValues = {
    product: initialProduct || null,
    quantity: 1,
    measurement: "",
    specification: "",
    ...(isLoggedIn ? {} : {
      emailAddress: "",
      mobileNumber: "",
    })
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Update form values when initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setValue("product", initialProduct)
      setValue("measurement", "") // Reset measurement when product changes
    }
  }, [initialProduct, setValue])

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
        ...(isLoggedIn ? {} : {
          emailAddress: (data as unknown).emailAddress,
          mobileNumber: (data as unknown).mobileNumber,
        })
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label className="text-md font-medium text-gray-700">Product Name</Label>
              {initialProduct ? (
                <Input
                  value={initialProduct.name}
                  readOnly
                  className="h-10 bg-gray-100 cursor-not-allowed"
                />
              ) : (
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
              )}
            </div>

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
          </div>

          {/* Specification - Full width textarea */}
          <div className="space-y-2">
            <Label className="text-md font-medium text-gray-700">Specification</Label>
            <Controller
              name="specification"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder={control._formValues.measurement ? `e.g., 1000 ${control._formValues.measurement}, color preferences, size requirements, etc.` : "Enter detailed specifications, requirements, or special instructions"}
                  className="min-h-24 resize-vertical"
                  rows={3}
                />
              )}
            />
          </div>

          {/* Contact Information - Only show if user is not logged in */}
          {!isLoggedIn && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Address */}
              <div className="space-y-2">
                <Label className="text-md font-medium text-gray-700">Email Address *</Label>
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

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label className="text-md font-medium text-gray-700">Mobile Number *</Label>
                <Controller
                  name="mobileNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="tel"
                      {...field}
                      placeholder="IN +91 Enter mobile number"
                      className="h-10"
                    />
                  )}
                />
                {errors.mobileNumber && (
                  <p className="text-md text-red-500">{errors.mobileNumber.message}</p>
                )}
              </div>
            </div>
          )}

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
                "Submit Inquiry"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}