"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Copy } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

export function ErrorMessageDialog({ isOpen, onClose, errorMessage }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(errorMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-red-500">Hata Detayları</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={handleCopy}>
              {copied ? "Kopyalandı!" : "Kopyala"}
              <Copy className="ml-1 h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[300px] rounded-md border p-4 bg-gray-50 font-mono text-sm">
          <pre className="whitespace-pre-wrap break-words">{errorMessage}</pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
