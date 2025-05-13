"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { API_URL } from "@/lib/api"
import { showFeedback } from "@/lib/feedback"

// API fonksiyonu
export const getLabelList = async (customerCode, projectCode, panoCode, listName) => {
  const res = await axios.get(
    `${API_URL}/customers/${customerCode}/projects/${projectCode}/panos/${panoCode}/labels/${listName}`,
  )
  return res.data.data
}

export default function DualLabelPreview({
  customerCode,
  projectCode,
  panoCode,
  originalListName,
  manipulatedListName,
  isOpen,
  onClose,
}) {
  const [viewMode, setViewMode] = useState("comparison")
  const [loading, setLoading] = useState(false)
  const [originalData, setOriginalData] = useState(null)
  const [manipulatedData, setManipulatedData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && customerCode && projectCode && panoCode && originalListName && manipulatedListName) {
      fetchBothLabelData()
    }
  }, [isOpen, customerCode, projectCode, panoCode, originalListName, manipulatedListName])

  const fetchBothLabelData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Orijinal ve manipüle edilmiş etiket verilerini paralel olarak al
      const [originalResult, manipulatedResult] = await Promise.all([
        getLabelList(customerCode, projectCode, panoCode, originalListName),
        getLabelList(customerCode, projectCode, panoCode, manipulatedListName),
      ])

      setOriginalData(originalResult)
      setManipulatedData(manipulatedResult)
    } catch (error) {
      console.error("Error fetching label data:", error)
      setError(error.response?.data?.message || error.message)
      showFeedback("error", error.response?.data?.message || "Etiket verileri yüklenirken bir hata oluştu", {
        operation: "Etiket önizleme",
      })
    } finally {
      setLoading(false)
    }
  }

  // Determine if we have valid data to display
  const hasValidData =
    originalData &&
    manipulatedData &&
    originalData.labels &&
    manipulatedData.labels &&
    originalData.labels.length > 0 &&
    manipulatedData.labels.length > 0

  // Determine label type for conditional rendering
  const isDeviceBMK = originalData?.labelType === "DeviceBMK"
  const isAderBMK = originalData?.labelType === "AderBMK"
  const isKlemensBMK = originalData?.labelType === "KlemensBMK"

  // Render table based on label type
  const renderTableContent = (data, isOriginal = true) => {
    if (!data || !data.labels) return null

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Grup Etiketi</TableHead>
            {isDeviceBMK ? (
              <>
                <TableHead>Eşit Yapı</TableHead>
                <TableHead>Artı Yapı</TableHead>
                <TableHead>Eksi Yapı</TableHead>
                <TableHead>Birleştirilmiş Değer</TableHead>
                <TableHead>Ürün Kodu</TableHead>
              </>
            ) : (
              <>
                <TableHead>Etiket 1</TableHead>
                <TableHead>Etiket 2</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.labels.map((label, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{label.groupLabel}</TableCell>
              {isDeviceBMK ? (
                <>
                  <TableCell className="whitespace-pre">{label.equalsStructure || "-"}</TableCell>
                  <TableCell className="whitespace-pre">{label.plusStructure || "-"}</TableCell>
                  <TableCell className="whitespace-pre">{label.minusStructure || "-"}</TableCell>
                  <TableCell className="whitespace-pre">{label.mergedValue || "-"}</TableCell>
                  <TableCell className="whitespace-pre">{label.productCode || "-"}</TableCell>
                </>
              ) : (
                <>
                  <TableCell className="whitespace-pre">{label.rowItems?.[0] || "-"}</TableCell>
                  <TableCell className="whitespace-pre">{label.rowItems?.[1] || "-"}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  // Render simplified table for side-by-side comparison
  const renderComparisonTable = (data, isOriginal = true) => {
    if (!data || !data.labels) return null

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Grup Etiketi</TableHead>
            {isDeviceBMK ? <TableHead>Birleştirilmiş Değer</TableHead> : <TableHead>Etiket</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.labels.map((label, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{label.groupLabel}</TableCell>
              <TableCell className="whitespace-pre">
                {isDeviceBMK ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Karşılaştırmalı Etiket Önizleme</DialogTitle>
          {originalData && manipulatedData && (
            <div className="text-sm text-muted-foreground mt-1">
              <p>
                Müşteri: {originalData.customerName} | Proje: {originalData.projectName} | Pano: {originalData.panoName}
              </p>
              <p>
                Orijinal Liste: {originalData.listName} | Manipüle Liste: {manipulatedData.listName}
              </p>
              <p>
                Etiket Tipi: {originalData.labelType} | Toplam Kayıt: {originalData.labels?.length || 0}
              </p>
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Etiket verileri yükleniyor...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center text-red-500">
              <p>Hata oluştu:</p>
              <p>{error}</p>
              <Button variant="outline" onClick={fetchBothLabelData} className="mt-4">
                Tekrar Dene
              </Button>
            </div>
          </div>
        ) : !hasValidData ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center text-muted-foreground">
              <p>Görüntülenecek etiket verisi bulunamadı.</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="comparison" className="w-full" onValueChange={(value) => setViewMode(value)}>
            <TabsList className="mb-4">
              <TabsTrigger value="comparison">Karşılaştırmalı Görünüm</TabsTrigger>
              <TabsTrigger value="original">Orijinal Etiketler</TabsTrigger>
              <TabsTrigger value="manipulated">Manipüle Edilmiş Etiketler</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="mt-0">
              <div className="grid grid-cols-2 gap-4 h-[60vh]">
                {/* Original Labels */}
                <div className="border rounded-md overflow-hidden flex flex-col">
                  <div className="bg-gray-100 p-3 font-medium border-b">
                    Orijinal Etiketler: {originalData.listName}
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-4">{renderComparisonTable(originalData, true)}</div>
                  </ScrollArea>
                </div>

                {/* Manipulated Labels */}
                <div className="border rounded-md overflow-hidden flex flex-col">
                  <div className="bg-gray-100 p-3 font-medium border-b">
                    Manipüle Edilmiş Etiketler: {manipulatedData.listName}
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-4">{renderComparisonTable(manipulatedData, false)}</div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="original" className="mt-0">
              <ScrollArea className="h-[60vh]">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4">Orijinal Etiketler: {originalData.listName}</h3>
                  {renderTableContent(originalData, true)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="manipulated" className="mt-0">
              <ScrollArea className="h-[60vh]">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4">Manipüle Edilmiş Etiketler: {manipulatedData.listName}</h3>
                  {renderTableContent(manipulatedData, false)}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
