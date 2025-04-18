"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "./loading-button"

export function FeedbackDialog({ 
  title, 
  trigger, 
  onConfirm, 
  children,
  confirmText = "Kaydet",
  cancelText = "İptal",
  closeOnConfirm = true // Yeni prop eklendi
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm?.()
      if (closeOnConfirm) { // Sadece closeOnConfirm true ise kapat
        setOpen(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 overflow-y-auto max-h-[calc(90vh-150px)]">
          {children}
        </div>
        
        <DialogFooter className="border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={loading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          <LoadingButton 
            isLoading={loading} 
            onClick={handleConfirm}
            className="min-w-[80px]"
          >
            {confirmText}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}