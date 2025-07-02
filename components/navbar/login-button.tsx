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
import { Loader2 } from "lucide-react"
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
      router.push("/dashboard/profile")
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
          className={`${className || "text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white"}`}
        >
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login to Sabecho</DialogTitle>
          <DialogDescription>Enter your email to receive an OTP, then verify to log in.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || otpSent}
            />
          </div>
          {otpSent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} disabled={isLoading}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-sm text-gray-500">Enter the 6-digit OTP sent to your email.</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Resend OTP in {formatCountdown(countdown)}
                </p>
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={!resendAvailable || isLoading}
                  className="text-blue-600"
                >
                  Resend OTP
                </Button>
              </div>
            </>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          {!otpSent ? (
            <Button
              onClick={handleGenerateOtp}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP & Login"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}