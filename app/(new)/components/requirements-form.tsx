"use client"

import { useEffect, useState } from "react"
import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronDown, Loader2, Package, Mail, Phone, FileText, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import SearchCombobox from "@/components/products/product-search"
import type { Product, UserDetails, VerifyTokenResponse } from "@/components/types"

// Static measurement options as fallback
const MEASUREMENT_OPTIONS = ["NOS", "Units", "Boxes", "KG", "Grams", "Liters", "Meters", "Pieces"]

interface RequirementsFormProps {
  initialProduct?: Product | null
}

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

const baseFormSchema = z.object({
  product: z
    .object({
      _id: z.string(),
      location: z.string(),
      categoryType: z.string(),
      categorySubType: z.string(),
      name: z.string(),
      p_name: z.string(),
      brand: z.string(),
    })
    .nullable(),
  quantity: z.number().min(1, "Quantity must be at least 1").int("Quantity must be an integer"),
  measurement: z.string().min(1, "Please select a measurement"),
  specification: z.string().optional(),
  emailAddress: z.string().email("Please enter a valid email address").optional(),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits").optional(),
})

type FormData = z.infer<typeof baseFormSchema>

export default function RequirementsForm({ initialProduct = null }: RequirementsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openMeasurementDropdown, setOpenMeasurementDropdown] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)

  // Get measurement options from initialProduct or fallback to static options
  const getMeasurementOptions = () => {
    if (initialProduct?.measurementOptions && Array.isArray(initialProduct.measurementOptions)) {
      return initialProduct.measurementOptions
    }
    return MEASUREMENT_OPTIONS
  }

  const measurementOptions = getMeasurementOptions()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(baseFormSchema),
    defaultValues: {
      product: initialProduct || null,
      quantity: 1,
      measurement: measurementOptions[0] || "NOS",
      specification: "",
      emailAddress: "",
      mobileNumber: "",
    },
    mode: "onChange",
  })

  // Set default measurement when initialProduct is provided
  useEffect(() => {
    if (initialProduct) {
      const defaultMeasurement = measurementOptions[0] || "NOS"
      setValue("measurement", defaultMeasurement)
    }
  }, [initialProduct, setValue, measurementOptions])

  useEffect(() => {
    const initializeUser = async () => {
      const token = getCookie("token")
      if (!token) {
        setLoading(false)
        return
      }
      try {
        // Verify token
        const verifyResponse = await fetch(`/api/v1/auth/verifyToken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const verifyData: VerifyTokenResponse = await verifyResponse.json()
        if (!verifyData.userType || !verifyData.email) {
          throw new Error("Invalid token")
        }
        // Fetch user details
        const profileResponse = await fetch(`/api/v1/users/profile?email=${verifyData.email}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        const userData = await profileResponse.json()
        setUserDetails(userData)
        setValue("emailAddress", userData.email || "")
        setValue("mobileNumber", userData.mobileNo || "")
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    initializeUser()
  }, [setValue])

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!data.product) {
      toast("Error", { description: "Please select a product" })
      return
    }
    setIsSubmitting(true)
    try {
      const token = getCookie("token")
      const payload = {
        company: userDetails?.companyName || "",
        email: userDetails?.email || data.emailAddress || "",
        gstNo: userDetails?.gstNo || "",
        measurement: data.measurement,
        minQty: data.quantity,
        mobile: userDetails?.mobileNo || data.mobileNumber || "",
        name: data.product.name,
        pid: Number(data.product._id) || 0,
        pincode: userDetails?.pincode || "",
        specification: data.specification || "",
        userType: userDetails?.userType || "buyer",
      }

      if (!payload.email || !payload.mobile) {
        toast("Error", { description: "Email and mobile number are required" })
        return
      }

      const response = await fetch(`/api/v1/requirements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && userDetails ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to submit")
      toast("Success", { description: "Requirements submitted successfully!" })

      reset({
        product: null,
        quantity: 1,
        measurement: measurementOptions[0] || "NOS",
        specification: "",
        emailAddress: userDetails?.email || "",
        mobileNumber: userDetails?.mobileNo || "",
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast("Error", { description: "Failed to submit requirements" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex items-center space-x-3 text-orange-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg font-medium">Loading form...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Product Quotation</h2>
        <p className="text-gray-600 text-lg">Fill out the form below and we&apos;ll get back to you with the best quote</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Product Selection Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-orange-700">
              <Package className="mr-2 h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-orange-500" />
                  Product Name *
                </Label>
                {initialProduct ? (
                  <div className="relative">
                    <Input
                      value={initialProduct.name}
                      readOnly
                      className="h-12 bg-white border-2 border-orange-200 font-medium text-gray-800"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                ) : (
                  <Controller
                    name="product"
                    control={control}
                    render={({ field }) => (
                      <SearchCombobox
                        label=""
                        placeholder="Search and select a product..."
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value)
                          const newMeasurementOptions = value?.measurementOptions || MEASUREMENT_OPTIONS
                          setValue("measurement", newMeasurementOptions[0] || "NOS")
                        }}
                        error={errors.product?.message}
                      />
                    )}
                  />
                )}
                {errors.product && (
                  <p className="text-sm text-red-500 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {errors.product.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Calculator className="w-4 h-4 mr-2 text-orange-500" />
                  Quantity *
                </Label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                      className="h-12 border-2 border-gray-200 focus:border-orange-500 text-lg font-medium"
                      placeholder="Enter quantity"
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Unit of Measurement *</Label>
                <Controller
                  name="measurement"
                  control={control}
                  render={({ field }) => (
                    <Popover open={openMeasurementDropdown} onOpenChange={setOpenMeasurementDropdown}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-12 border-2 border-gray-200 hover:border-orange-500 text-lg font-medium bg-transparent"
                        >
                          {field.value || "Select measurement"}
                          <ChevronDown className="ml-2 h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandList>
                            <CommandGroup>
                              {measurementOptions.map((measurement: string) => (
                                <CommandItem
                                  key={measurement}
                                  onSelect={() => {
                                    field.onChange(measurement)
                                    setOpenMeasurementDropdown(false)
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === measurement ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {measurement}
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
                  <p className="text-sm text-red-500 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {errors.measurement.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        {!userDetails && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-blue-700">
                <Mail className="mr-2 h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                    Email Address *
                  </Label>
                  <Controller
                    name="emailAddress"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="email"
                        {...field}
                        placeholder="Enter your email address"
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 text-lg"
                      />
                    )}
                  />
                  {errors.emailAddress && (
                    <p className="text-sm text-red-500 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {errors.emailAddress.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-blue-500" />
                    Mobile Number *
                  </Label>
                  <Controller
                    name="mobileNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="tel"
                        {...field}
                        placeholder="IN +91 Enter mobile number"
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 text-lg"
                      />
                    )}
                  />
                  {errors.mobileNumber && (
                    <p className="text-sm text-red-500 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {errors.mobileNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Specifications Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-green-700">
              <FileText className="mr-2 h-5 w-5" />
              Additional Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Detailed Specifications (Optional)</Label>
              <Controller
                name="specification"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Please provide any specific requirements, dimensions, quality standards, or other details..."
                    className="min-h-32 border-2 border-gray-200 focus:border-green-500 text-base resize-none"
                    rows={4}
                  />
                )}
              />
              <p className="text-sm text-gray-500">
                The more details you provide, the more accurate quote we can offer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Submitting Your Request...
              </>
            ) : (
              <>
                <Package className="mr-3 h-5 w-5" />
                Submit Quotation Request
              </>
            )}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Our team will review your request and get back to you within{" "}
            <span className="font-semibold text-orange-600">24 hours</span>
          </p>
        </div>
      </form>
    </div>
  )
}
