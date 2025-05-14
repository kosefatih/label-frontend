"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

export default function ManipulatedLabelsPreview({
  customerName,
  projectName,
  panoName,
  listName,
  applyListName,
  labelType,
  labels,
  originalLabels,
  isOpen,
  onClose,
}) {
  const [showOriginal, setShowOriginal] = useState(true)

  if (labelType !== "AderBMK") return null

  // Döndürme uygulayan yardımcı fonksiyon
  const renderRotatedCell = (value, rotateDegree, index) => {
    // Eğer value yoksa veya null/undefined ise "-" göster
    if (!value && value !== 0) {
      return (
        <td key={index} className="border p-2 whitespace-pre">
          -
        </td>
      )
    }

    // rotateDegree kontrolü (null/undefined/NaN durumlarında 0 kabul et)
    const degree = rotateDegree === 180 ? 180 : 0

    if (degree === 180) {
      return (
        <td key={index} className="border p-2 whitespace-pre">
          <div className="transform rotate-180 inline-block origin-center">
            {value}
          </div>
        </td>
      )
    }
    
    return (
      <td key={index} className="border p-2 whitespace-pre">
        {value}
      </td>
    )
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-full max-w-none h-[90vh] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">
            <div className="flex justify-between items-center">
              <span>Etiket Önizleme: {applyListName}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
              >
                {showOriginal ? "Orijinal Listeyi Gizle" : "Orijinal Listeyi Göster"}
              </Button>
            </div>
          </DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            <p>
              Müşteri: {customerName} | Proje: {projectName} | Pano: {panoName} | Liste: {listName}
            </p>
            <p>
              Etiket Tipi: {labelType} | Toplam Kayıt: {labels.length}
            </p>
          </div>
        </DialogHeader>

        <div className="flex gap-4 overflow-x-auto mt-4">
          {/* Orijinal Tablo (her zaman göster, solda) */}
          {originalLabels && (
            <div className="min-w-[50%] max-w-full border rounded-md">
              <div className="font-semibold text-lg px-4 py-2 border-b bg-gray-100">
                Orijinal Etiketler
              </div>
              <ScrollArea className="h-[60vh]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2 text-left">#</th>
                      <th className="border p-2 text-left">Grup Etiketi</th>
                      <th className="border p-2 text-left">Etiket 1</th>
                      <th className="border p-2 text-left">Etiket 2</th>
                      <th className="border p-2 text-left">Döndürme 1</th>
                      <th className="border p-2 text-left">Döndürme 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {originalLabels.map((label, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2">{label.groupLabel}</td>
                        <td className="border p-2 whitespace-pre">{label.rowItems[0]}</td>
                        <td className="border p-2 whitespace-pre">{label.rowItems[1] || "-"}</td>
                        {renderRotatedCell(label.rowItemsRotates?.[0], label.rowItemsRotates?.[0], 0)}
                        {renderRotatedCell(label.rowItemsRotates?.[1], label.rowItemsRotates?.[1], 1)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          )}

          {/* Manipüle Edilmiş Tablo (sağda) */}
          <div className="min-w-[50%] max-w-full border rounded-md">
            <div className="font-semibold text-lg px-4 py-2 border-b bg-gray-100">
              Manipüle Edilmiş Etiketler
            </div>
            <ScrollArea className="h-[60vh]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2 text-left">#</th>
                    <th className="border p-2 text-left">Grup Etiketi</th>
                    <th className="border p-2 text-left">Etiket 1</th>
                    <th className="border p-2 text-left">Etiket 2</th>
                  </tr>
                </thead>
                <tbody>
                  {labels.map((label, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{label.groupLabel}</td>
                      <td className="border p-2 whitespace-pre">{label.rowItems[0]}</td>
                      <td className="border p-2 whitespace-pre">{label.rowItems[1] || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}