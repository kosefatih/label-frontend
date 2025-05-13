"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

export default function OriginalLabelsPreview({
  customerName,
  projectName,
  panoName,
  listName,
  labelType,
  labels,
  isOpen,
  onClose,
}) {
  const [viewMode, setViewMode] = useState("table")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Orijinal Etiket Önizleme: {listName}</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            <p>
              Müşteri: {customerName} | Proje: {projectName} | Pano: {panoName} | Liste: {listName}
            </p>
            <p>
              Etiket Tipi: {labelType} | Toplam Kayıt: {labels.length}
            </p>
          </div>
        </DialogHeader>

        <Tabs defaultValue="table" className="w-full" onValueChange={(value) => setViewMode(value)}>
          <TabsList className="mb-4">
            <TabsTrigger value="table">Tablo Görünümü</TabsTrigger>
            <TabsTrigger value="raw">Ham Veri</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-0">
            <ScrollArea className="h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    {labelType === "DeviceBMK" && <TableHead>Grup Etiketi</TableHead>}
                    <TableHead>Etiket Değerleri</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labels.map((label, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      {labelType === "DeviceBMK" && <TableCell>{label.groupLabel}</TableCell>}
                      <TableCell className="whitespace-pre">
                        {label.rowItems?.filter(Boolean).join("\n") || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="mt-0">
            <ScrollArea className="h-[60vh] border rounded-md">
              <div className="p-4 bg-white">
                <pre className="text-sm">{JSON.stringify(labels, null, 2)}</pre>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}