"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "./loading-button"

export function FeedbackDialog({ title, trigger, onConfirm, showFeedback, children }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Dialog açıldığında listeyi yükle
  useEffect(() => {
    if (open && !loading) {
      // Listeleri yükle
      onConfirm()
    }
  }, [open, onConfirm, loading])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      showFeedback("success", "Manipüle edilmiş listeler yüklendi", { operation: "Liste yükleme" })
      setOpen(false)
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Liste yükleme" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            İptal
          </Button>
          <LoadingButton isLoading={loading} onClick={handleConfirm}>
            Kaydet
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
