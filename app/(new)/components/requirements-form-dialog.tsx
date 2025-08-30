"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import RequirementsForm from "./requirements-form"

interface RequirementsFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RequirementsFormDialog({ open, onOpenChange }: RequirementsFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">Get Product Quotation</DialogTitle>
        </DialogHeader>
        <RequirementsForm />
      </DialogContent>
    </Dialog>
  )
}
