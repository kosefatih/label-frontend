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

export default function LabelComparisonPreview({
  customerCode,
  projectCode,
  panoCode,
  listName,
  applyListName,
  isOpen,
  onClose,
}) {
  const [viewMode, setViewMode] = useState("table")
  const [loading, setLoading] = useState(false)
  const [labelData, setLabelData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && customerCode && projectCode && panoCode && listName) {
      fetchLabelData()
    }
  }, [isOpen, customerCode, projectCode, panoCode, listName, applyListName])

  const fetchLabelData = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await axios.get(
        `${API_URL}/customers/${customerCode}/projects/${projectCode}/panos/${panoCode}/labels/${listName}`,
      )

      setLabelData(res.data.data)
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
  const hasValidData = labelData && labelData.labels && labelData.labels.length > 0

  // Determine label type for conditional rendering
  const isDeviceBMK = labelData?.labelType === "DeviceBMK"
  const isAderBMK = labelData?.labelType === "AderBMK"
  const isKlemensBMK = labelData?.labelType === "KlemensBMK"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Karşılaştırmalı Etiket Önizleme: {applyListName}</DialogTitle>
          {labelData && (
            <div className="text-sm text-muted-foreground mt-1">
              <p>
                Müşteri: {labelData.customerName} | Proje: {labelData.projectName} | Pano: {labelData.panoName} | Liste:{" "}
                {labelData.listName}
              </p>
              <p>
                Etiket Tipi: {labelData.labelType} | Toplam Kayıt: {labelData.labels?.length || 0}
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
              <Button variant="outline" onClick={fetchLabelData} className="mt-4">
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
          <Tabs defaultValue="table" className="w-full" onValueChange={(value) => setViewMode(value)}>
            <TabsList className="mb-4">
              <TabsTrigger value="table">Tablo Görünümü1111</TabsTrigger>
              <TabsTrigger value="excel">Excel Önizleme</TabsTrigger>
              <TabsTrigger value="comparison">Karşılaştırmalı Görünüm</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-0">
              <ScrollArea className="h-[60vh]">
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
                    {labelData.labels.map((label, index) => (
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
              </ScrollArea>
            </TabsContent>

            <TabsContent value="excel" className="mt-0">
              <ScrollArea className="h-[60vh] border rounded-md">
                <div className="p-4 bg-white">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Etiket</th>
                        <th className="border border-gray-300 p-2 text-left">Tekrar 1</th>
                        <th className="border border-gray-300 p-2 text-left">Tekrar 2</th>
                        <th className="border border-gray-300 p-2 text-left">Tekrar 3</th>
                        <th className="border border-gray-300 p-2 text-left">Tekrar 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labelData.labels.map((label, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                          <td className="border border-gray-300 p-2 whitespace-pre">
                            {isDeviceBMK ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 whitespace-pre">
                            {isDeviceBMK ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 whitespace-pre">
                            {isDeviceBMK ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 whitespace-pre">
                            {isDeviceBMK ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 whitespace-pre">
                            {isDeviceBMK ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="comparison" className="mt-0">
              <div className="grid grid-cols-2 gap-4 h-[60vh]">
                {/* Original Labels */}
                <div className="border rounded-md overflow-hidden flex flex-col">
                  <div className="bg-gray-100 p-3 font-medium border-b">Orijinal Etiketler</div>
                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Grup Etiketi</TableHead>
                            {isDeviceBMK ? <TableHead>Birleştirilmiş Değer</TableHead> : <TableHead>Etiket</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {labelData.labels.map((label, index) => (
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
                    </div>
                  </ScrollArea>
                </div>

                {/* Manipulated Labels */}
                <div className="border rounded-md overflow-hidden flex flex-col">
                  <div className="bg-gray-100 p-3 font-medium border-b">Manipüle Edilmiş Etiketler</div>
                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Grup Etiketi</TableHead>
                            {isDeviceBMK ? <TableHead>Birleştirilmiş Değer</TableHead> : <TableHead>Etiket</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {labelData.labels.map((label, index) => (
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
                    </div>
                  </ScrollArea>
                </div>
              </div>
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
