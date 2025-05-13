"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

export default function CombinedLabelsPreview({
  customerName,
  projectName,
  panoName,
  listName,
  applyListName,
  labelType,
  originalLabels,
  manipulatedLabels,
  isOpen,
  onClose,
}) {
  const [viewMode, setViewMode] = useState("table")

  // Only render for AderBMK type
  if (labelType !== "AderBMK") {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Etiket Önizleme Karşılaştırması</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            <p>
              Müşteri: {customerName} | Proje: {projectName} | Pano: {panoName}
            </p>
            <p>
              Orijinal Liste: {listName} | Manipüle Liste: {applyListName} | Etiket Tipi: {labelType}
            </p>
          </div>
        </DialogHeader>

        <div className="flex gap-4">
          {/* Original Labels Panel */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Orijinal Etiketler ({originalLabels.length} Kayıt)</h3>
            <Tabs defaultValue="table" className="w-full" onValueChange={(value) => setViewMode(value)}>
              <TabsList className="mb-4">
                <TabsTrigger value="table">Tablo Görünümü</TabsTrigger>
                <TabsTrigger value="raw">Ham Veri</TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="mt-0">
                <ScrollArea className="h-[50vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Grup Etiketi</TableHead>
                        <TableHead>Etiket 1</TableHead>
                        <TableHead>Etiket 2</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {originalLabels.map((label, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{label.groupLabel || "-"}</TableCell>
                          <TableCell className="whitespace-pre">{label.rowItems[0] || "-"}</TableCell>
                          <TableCell className="whitespace-pre">{label.rowItems[1] || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="raw" className="mt-0">
                <ScrollArea className="h-[50vh] border rounded-md">
                  <div className="p-4 bg-white">
                    <pre className="text-sm">{JSON.stringify(originalLabels, null, 2)}</pre>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Manipulated Labels Panel */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Manipüle Etiketler ({manipulatedLabels.length} Kayıt)</h3>
            <Tabs defaultValue="table" className="w-full" onValueChange={(value) => setViewMode(value)}>
              <TabsList className="mb-4">
                <TabsTrigger value="table">Tablo Görünümü</TabsTrigger>
                <TabsTrigger value="excel">Excel Önizleme</TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="mt-0">
                <ScrollArea className="h-[50vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Grup Etiketi</TableHead>
                        <TableHead>Etiket 1</TableHead>
                        <TableHead>Etiket 2</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manipulatedLabels.map((label, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{label.groupLabel}</TableCell>
                          <TableCell className="whitespace-pre">{label.rowItems[0]}</TableCell>
                          <TableCell className="whitespace-pre">{label.rowItems[1] || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="excel" className="mt-0">
                <ScrollArea className="h-[50vh] border rounded-md">
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
                        {manipulatedLabels.map((label, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                            <td className="border border-gray-300 p-2 whitespace-pre">{label.rowItems[0]}</td>
                            <td className="border border-gray-300 p-2 whitespace-pre">{label.rowItems[0]}</td>
                            <td className="border border-gray-300 p-2 whitespace-pre">{label.rowItems[0]}</td>
                            <td className="border border-gray-300 p-2 whitespace-pre">{label.rowItems[0]}</td>
                            <td className="border border-gray-300 p-2 whitespace-pre">{label.rowItems[0]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
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