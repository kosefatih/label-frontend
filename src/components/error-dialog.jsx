"use client"
import { AlertCircle, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ErrorDialog({ isOpen, onClose, error }) {
  if (!error) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <DialogTitle className="text-red-500">Hata Detayları</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Özet</h3>
            <p className="text-base font-medium">{error.summary}</p>
          </div>

          {error.moduleInfo && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Modül</h3>
              <p className="text-sm">{error.moduleInfo}</p>
            </div>
          )}

          {error.repositoryInfo && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Repository</h3>
              <p className="text-sm">{error.repositoryInfo}</p>
            </div>
          )}

          {error.detailedList && error.detailedList.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Detaylı Bilgi</h3>
              <Separator className="my-2" />
              <ScrollArea className="h-[200px] rounded-md border p-2">
                <ul className="space-y-1">
                  {error.detailedList.map((item, index) => (
                    <li key={index} className="text-sm py-1 border-b border-gray-100 last:border-0">
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
