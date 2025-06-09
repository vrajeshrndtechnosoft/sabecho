"use client"

import { useState, useEffect } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
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
  CommandEmpty,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from 'sonner'
import SearchCombobox from "./product-search"
import { Product } from "@/components/types"

interface RequirementsFormProps {
  initialProduct?: Product | null
}

interface UserDetails {
  _id: string
  email: string
  name: string
  companyName: string
  mobileNo: string
  gstNo: string
  userType: string
  pincode: string
  verify: boolean
  shippingDetails: string
  tradeNam: string
  profileImage: string
  userId: string
  billingDetails: string
  createdAt: string
}

interface VerifyTokenResponse {
  success: boolean
  email?: string
  message?: string
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const baseFormSchema = z.object({
  product: z.object({
    _id: z.string(),
    location: z.string(),
    categoryType: z.string(),
    categorySubType: z.string(),
    name: z.string(),
    measurementOptions: z.array(z.string()),
  }).nullable(),
  quantity: z.number().min(1, "Quantity must be at least 1").int("Quantity must be an integer"),
  measurement: z.string().min(1, "Please select a measurement"),
  specification: z.string().optional(),
  emailAddress: z.string().email("Please enter a valid email address"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
})

type FormData = z.infer<typeof baseFormSchema>

export default function RequirementsForm({ initialProduct = null }: RequirementsFormProps) {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openMeasurementDropdown, setOpenMeasurementDropdown] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [userError, setUserError] = useState<string | null>(null)

  const verifyAndFetchUser = async (token: string): Promise<UserDetails> => {
    setIsUserLoading(true)
    setUserError(null)

    try {
      console.log('Verifying token:', token)
      const verifyResponse = await fetch('https://sabecho.com/api/v1/verifyToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}))
        throw new Error(`Token verification failed: ${errorData.message || verifyResponse.statusText} (Status: ${verifyResponse.status})`)
      }

      const verifyData: VerifyTokenResponse = await verifyResponse.json()
      console.log('Token verification response:', verifyData)

      if (!verifyData.success || !verifyData.email) {
        throw new Error(verifyData.message || 'Invalid token')
      }

      console.log('Fetching profile for email:', verifyData.email)
      const profileResponse = await fetch(
        `https://sabecho.com/api/v1/profile?email=${encodeURIComponent(verifyData.email)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({}))
        throw new Error(`Failed to fetch user details: ${errorData.message || profileResponse.statusText} (Status: ${profileResponse.status})`)
      }

      const userData: UserDetails = await profileResponse.json()
      console.log('Fetched user details:', userData)
      setUserDetails(userData)
      return userData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('Error in verifyAndFetchUser:', errorMessage)
      setUserError(errorMessage)
      setUserDetails(null)
      throw err
    } finally {
      setIsUserLoading(false)
    }
  }

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = getCookie('token')
      const userType = getCookie('usertype')
      const loginStatus = !!(token && userType)
      console.log('Login status checked:', loginStatus, 'Token:', token, 'UserType:', userType)
      setIsLoggedIn(loginStatus)

      if (loginStatus && token) {
        try {
          await verifyAndFetchUser(token)
        } catch (error) {
          console.error('Failed to fetch user details:', error)
          toast("Error", {
            description: "Failed to fetch user details. Please try logging in again.",
          })
          setIsLoggedIn(false)
        }
      }
    }

    checkLoginStatus()
  }, [])

  const defaultValues: FormData = {
    product: initialProduct || null,
    quantity: 1,
    measurement: "",
    specification: "",
    emailAddress: isLoggedIn ? (userDetails?.email || "") : "",
    mobileNumber: isLoggedIn ? (userDetails?.mobileNo || "") : "",
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(baseFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const watchedProduct = watch("product")
  const watchedMeasurement = watch("measurement")

  useEffect(() => {
    if (initialProduct) {
      setValue("product", initialProduct)
      setValue("measurement", "")
    }
    if (isLoggedIn && userDetails) {
      setValue("emailAddress", userDetails.email || "")
      setValue("mobileNumber", userDetails.mobileNo || "")
    }
  }, [initialProduct, userDetails, isLoggedIn, setValue])

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      return []
    }

    try {
      const response = await fetch('https://sabecho.com/api/v1/products/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText} (Status: ${response.status})`)
      }

      const productsData = await response.json()

      const mappedProducts: Product[] = productsData.map((item: any) => ({
        _id: item._id,
        location: 'Unknown', // Default value since API doesn't provide this
        categoryType: 'Unknown', // Default value since API doesn't provide this
        categorySubType: 'Unknown', // Default value since API doesn't provide this
        name: item.name,
        measurementOptions: Array.isArray(item.measurements) ? item.measurements : [], // Map measurements, default to empty array
      }))

      const filteredResults = mappedProducts.filter((item: Product) =>
        item.name.toLowerCase().includes(term.toLowerCase())
      )

      setSearchResults(filteredResults)
      return filteredResults
    } catch (error) {
      console.error('Error fetching products:', error)
      toast("Error", {
        description: "Failed to fetch products. Please try again.",
      })
      return []
    }
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true)

    try {
      if (!data.product) {
        toast("Error", {
          description: "Please select a product",
        })
        return
      }

      if (isLoggedIn) {
        if (!userDetails) {
          throw new Error("User details not loaded. Please try logging in again.")
        }
        if (!userDetails.companyName || !userDetails.gstNo || !userDetails.pincode || !userDetails.userType) {
          throw new Error("Incomplete user profile. Please ensure your profile includes company name, GST number, pincode, and user type.")
        }
      }

      const payload = {
        company: isLoggedIn ? userDetails?.companyName || "" : "",
        email: isLoggedIn ? userDetails?.email || "" : data.emailAddress,
        gstNo: isLoggedIn ? userDetails?.gstNo || "" : "",
        measurement: data.measurement,
        minQty: data.quantity,
        mobile: isLoggedIn ? userDetails?.mobileNo || "" : data.mobileNumber,
        name: data.product.name,
        pid: Number(data.product._id) || 0,
        pincode: isLoggedIn ? userDetails?.pincode || "" : "",
        specification: data.specification || "",
        userType: isLoggedIn ? userDetails?.userType || "" : "",
      }

      console.log('Submitting payload:', payload)

      const token = getCookie('token')
      const response = await fetch('https://sabecho.com/api/v1/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && isLoggedIn ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to submit requirements: ${errorData.message || response.statusText} (Status: ${response.status})`)
      }

      const responseData = await response.json()
      console.log("Form submitted successfully:", responseData)
      toast("Success", {
        description: "Your requirements have been submitted successfully!",
      })

      reset()
      setSearchResults([])
    } catch (error) {
      console.error("Error submitting requirements:", error)
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to submit your requirements. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      {isUserLoading && <p>Loading user details...</p>}
      {userError && <p className="text-red-500">Error: {userError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <SearchCombobox
                    label="Product Name"
                    placeholder="Search products..."
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value)
                      setValue("measurement", "")
                    }}
                    onSearch={handleSearch}
                    error={errors.product?.message}
                  />
                )}
              />
            )}
          </div>

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
                      disabled={!watchedProduct}
                    >
                      <span className="truncate">
                        {field.value || (watchedProduct ? "Select measurement" : "Select product first")}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0" align="start">
                    <Command>
                      <CommandList className="max-h-48">
                        <CommandGroup>
                          {Array.isArray(watchedProduct?.measurementOptions) && watchedProduct.measurementOptions.length > 0 ? (
                            watchedProduct.measurementOptions.map((measurement: string) => (
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
                            ))
                          ) : (
                            <CommandEmpty>No measurements available</CommandEmpty>
                          )}
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

        <div className="space-y-2">
          <Label className="text-md font-medium text-gray-700">Specification</Label>
          <Controller
            name="specification"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder={watchedMeasurement ? `e.g., 1000 ${watchedMeasurement}, color preferences, size requirements, etc.` : "Enter detailed specifications, requirements, or special instructions"}
                className="min-h-24 resize-vertical"
                rows={3}
              />
            )}
          />
        </div>

        {!isLoggedIn && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md"
            disabled={isSubmitting || isUserLoading || (isLoggedIn && !userDetails)}
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
  )
}