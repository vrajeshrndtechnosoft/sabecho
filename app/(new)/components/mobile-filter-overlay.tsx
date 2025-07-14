"use client"

import { useEffect } from "react"

interface MobileFilterOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileFilterOverlay({ isOpen, onClose }: MobileFilterOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={onClose} />
}
