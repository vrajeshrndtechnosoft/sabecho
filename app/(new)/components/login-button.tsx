"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Shield } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface LoginProp {
  className?: string
}

export default function LoginButton({ className }: LoginProp) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [resendAvailable, setResendAvailable] = useState(false)
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds
  const router = useRouter()

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (otpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setResendAvailable(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [otpSent, countdown])

  // Format countdown time (MM:SS)
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`
  }

  // Handle OTP generation
  const handleGenerateOtp = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/auth/otp/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate OTP")
      }

      setOtpSent(true)
      setCountdown(300) // Reset countdown to 5 minutes
      setResendAvailable(false) // Disable resend button
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while generating OTP")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (!resendAvailable) return

    setIsLoading(true)
    setError(null)
    setOtp("") // Clear previous OTP

    try {
      const response = await fetch(`/api/v1/auth/otp/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Failed to resend OTP")
      }

      setCountdown(300) // Reset countdown
      setResendAvailable(false) // Disable resend button again
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while resending OTP")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP verification and login
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        email,
        otp,
        userType: "buyer",
      }

      const response = await fetch(`/api/v1/auth/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Invalid OTP")
      }

      const data = await response.json()
      const { token } = data

      // Store token and userType in cookies
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax` // 24 hours expiry
      document.cookie = `userType=buyer; path=/; max-age=86400; SameSite=Lax`

      // Close dialog and redirect
      setIsOpen(false)
      router.push("/home/dashboard/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset state when dialog is closed
      setOtpSent(false)
      setOtp("")
      setError(null)
      setCountdown(300)
      setResendAvailable(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`${
            className ||
            "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200"
          }`}
        >
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-gradient-to-br from-orange-50 to-gray-50">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            Welcome to Sabecho
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {!otpSent
              ? "Enter your email address to receive a secure OTP for login"
              : "Enter the 6-digit verification code sent to your email"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || otpSent}
              className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-lg"
            />
          </div>

          {otpSent && (
            <>
              <div className="space-y-3">
                <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                  Verification Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} disabled={isLoading}>
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot
                        index={0}
                        className="w-12 h-12 text-lg font-bold border-2 border-gray-200 focus:border-orange-500 rounded-lg"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-12 h-12 text-lg font-bold border-2 border-gray-200 focus:border-orange-500 rounded-lg"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-12 h-12 text-lg font-bold border-2 border-gray-200 focus:border-orange-500 rounded-lg"
                      />
                      <InputOTPSlot
                        index={3}
                        className="w-12 h-12 text-lg font-bold border-2 border-gray-200 focus:border-orange-500 rounded-lg"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-12 h-12 text-lg font-bold border-2 border-gray-200 focus:border-orange-500 rounded-lg"
                      />
                      <InputOTPSlot
                        index={5}
                        className="w-12 h-12 text-lg font-bold border-2 border-gray-200 focus:border-orange-500 rounded-lg"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  We&apos;ve sent a verification code to <span className="font-semibold text-orange-600">{email}</span>
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {countdown > 0 ? (
                      <>
                        Code expires in{" "}
                        <span className="font-mono font-bold text-orange-600">{formatCountdown(countdown)}</span>
                      </>
                    ) : (
                      <span className="text-red-600 font-semibold">Code expired</span>
                    )}
                  </p>
                  <Button
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={!resendAvailable || isLoading}
                    className="text-orange-600 hover:text-orange-700 font-semibold p-0 h-auto"
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {!otpSent ? (
            <Button
              onClick={handleGenerateOtp}
              disabled={isLoading || !email}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Login"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
