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
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import SearchCombobox from "./product-search"
import type { Product, UserDetails, VerifyTokenResponse } from "@/components/types"

const API_URL = process.env.API_URL || "http://localhost:3033"

// Static measurement options
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
      measurement: "NOS",
      specification: "",
      emailAddress: "",
      mobileNumber: "",
    },
    mode: "onChange",
  })


  // Set default measurement when initialProduct is provided
  useEffect(() => {
    if (initialProduct) {
      setValue("measurement", "NOS")
    }
  }, [initialProduct, setValue])

  useEffect(() => {
    const initializeUser = async () => {
      const token = getCookie("token")
      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Verify token
        const verifyResponse = await fetch(`${API_URL}/api/v1/verifyToken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const verifyData: VerifyTokenResponse = await verifyResponse.json()
        if (!verifyData.userType || !verifyData.email) {
          throw new Error("Invalid token")
        }

        // Fetch user details
        const profileResponse = await fetch(`${API_URL}/api/v1/profile?email=${verifyData.email}`, {
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

      const response = await fetch(`${API_URL}/api/v1/requirements`, {
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
        measurement: "NOS",
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
      <div className="p-6 flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="p-6">
      {userDetails && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            Welcome: {userDetails.email} ({userDetails.companyName})
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Product Name</Label>
              {initialProduct ? (
                <Input value={initialProduct.name} readOnly className="h-10 bg-gray-100" />
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
                        console.log("Selected product:", value); // Debug log
                        field.onChange(value);
                        // Keep default measurement as NOS when product changes
                        setValue("measurement", "NOS");
                      }}
                      error={errors.product?.message}
                    />
                  )}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Quantity</Label>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                    className="h-10"
                  />
                )}
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Measurement</Label>
              <Controller
                name="measurement"
                control={control}
                render={({ field }) => (
                  <Popover open={openMeasurementDropdown} onOpenChange={setOpenMeasurementDropdown}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-10"
                      >
                        {field.value || "Select measurement"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {MEASUREMENT_OPTIONS.map((measurement: string) => (
                              <CommandItem
                                key={measurement}
                                onSelect={() => {
                                  field.onChange(measurement);
                                  setOpenMeasurementDropdown(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === measurement ? "opacity-100" : "opacity-0"
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
              {errors.measurement && <p className="text-sm text-red-500">{errors.measurement.message}</p>}
            </div>
          </div>

          {!userDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Email Address *</Label>
                <Controller
                  name="emailAddress"
                  control={control}
                  render={({ field }) => (
                    <Input type="email" {...field} placeholder="Enter email address" className="h-10" />
                  )}
                />
                {errors.emailAddress && <p className="text-sm text-red-500">{errors.emailAddress.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Mobile Number *</Label>
                <Controller
                  name="mobileNumber"
                  control={control}
                  render={({ field }) => (
                    <Input type="tel" {...field} placeholder="IN +91 Enter mobile number" className="h-10" />
                  )}
                />
                {errors.mobileNumber && <p className="text-sm text-red-500">{errors.mobileNumber.message}</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Specification</Label>
            <Controller
              name="specification"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Enter specifications..."
                  className="min-h-24"
                  rows={3}
                />
              )}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 px-8">
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