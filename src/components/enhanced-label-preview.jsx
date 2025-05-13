"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function EnhancedLabelPreview({
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
  const [viewMode, setViewMode] = useState("comparison")
  const [searchTerm, setSearchTerm] = useState("")
  const [highlightDifferences, setHighlightDifferences] = useState(true)

  // Filter labels based on search term
  const filteredOriginalLabels = originalLabels?.filter(
    (label) =>
      label.groupLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.rowItems?.some((item) => item?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredLabels = labels?.filter(
    (label) =>
      label.groupLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.rowItems?.some((item) => item?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Function to check if a label has changed
  const hasLabelChanged = (originalLabel, manipulatedLabel, index) => {
    if (!originalLabel || !manipulatedLabel) return false

    // Check if group label changed
    if (originalLabel.groupLabel !== manipulatedLabel.groupLabel) return true

    // Check if any row item changed
    if (originalLabel.rowItems && manipulatedLabel.rowItems) {
      for (let i = 0; i < Math.max(originalLabel.rowItems.length, manipulatedLabel.rowItems.length); i++) {
        if (originalLabel.rowItems[i] !== manipulatedLabel.rowItems[i]) return true
      }
    }

    return false
  }

  // Function to highlight differences in text
  const highlightDiff = (original, modified) => {
    if (!original || !modified || !highlightDifferences) return modified

    if (original === modified) return modified

    return <span className="bg-yellow-100 text-yellow-800 px-1 rounded">{modified}</span>
  }

  // Only render for supported label types
  if (!["AderBMK", "KlemensBMK", "DeviceBMK"].includes(labelType)) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Gelişmiş Etiket Önizleme: {applyListName}</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            <p>
              Müşteri: {customerName} | Proje: {projectName} | Pano: {panoName} | Liste: {listName}
            </p>
            <p>
              Etiket Tipi: {labelType} | Toplam Kayıt: {labels?.length || 0}
            </p>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Etiketlerde ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="highlight-diff"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="highlight-diff" className="text-sm">
              Farkları Vurgula
            </label>
          </div>
        </div>

        <Tabs defaultValue="comparison" className="w-full" onValueChange={(value) => setViewMode(value)}>
          <TabsList className="mb-4">
            <TabsTrigger value="comparison">Karşılaştırmalı Görünüm</TabsTrigger>
            <TabsTrigger value="table">Tablo Görünümü</TabsTrigger>
            <TabsTrigger value="excel">Excel Önizleme</TabsTrigger>
            <TabsTrigger value="changes">Değişiklikler</TabsTrigger>
          </TabsList>

          {/* Karşılaştırmalı Görünüm */}
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
                          {labelType === "DeviceBMK" ? (
                            <>
                              <TableHead>Eşit Yapı</TableHead>
                              <TableHead>Artı Yapı</TableHead>
                              <TableHead>Eksi Yapı</TableHead>
                            </>
                          ) : (
                            <TableHead>Etiket</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOriginalLabels?.map((label, index) => (
                          <TableRow
                            key={index}
                            className={
                              hasLabelChanged(label, filteredLabels?.[index], index) && highlightDifferences
                                ? "bg-yellow-50"
                                : ""
                            }
                          >
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{label.groupLabel}</TableCell>
                            {labelType === "DeviceBMK" ? (
                              <>
                                <TableCell className="whitespace-pre">{label.equalsStructure || "-"}</TableCell>
                                <TableCell className="whitespace-pre">{label.plusStructure || "-"}</TableCell>
                                <TableCell className="whitespace-pre">{label.minusStructure || "-"}</TableCell>
                              </>
                            ) : (
                              <TableCell className="whitespace-pre">{label.rowItems?.[0] || "-"}</TableCell>
                            )}
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
                          {labelType === "DeviceBMK" ? (
                            <>
                              <TableHead>Eşit Yapı</TableHead>
                              <TableHead>Artı Yapı</TableHead>
                              <TableHead>Eksi Yapı</TableHead>
                            </>
                          ) : (
                            <TableHead>Etiket</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLabels?.map((label, index) => {
                          const originalLabel = filteredOriginalLabels?.[index]
                          return (
                            <TableRow
                              key={index}
                              className={
                                hasLabelChanged(originalLabel, label, index) && highlightDifferences
                                  ? "bg-yellow-50"
                                  : ""
                              }
                            >
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>
                                {highlightDifferences && originalLabel
                                  ? highlightDiff(originalLabel.groupLabel, label.groupLabel)
                                  : label.groupLabel}
                              </TableCell>
                              {labelType === "DeviceBMK" ? (
                                <>
                                  <TableCell className="whitespace-pre">
                                    {highlightDifferences && originalLabel
                                      ? highlightDiff(originalLabel.equalsStructure, label.equalsStructure)
                                      : label.equalsStructure || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-pre">
                                    {highlightDifferences && originalLabel
                                      ? highlightDiff(originalLabel.plusStructure, label.plusStructure)
                                      : label.plusStructure || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-pre">
                                    {highlightDifferences && originalLabel
                                      ? highlightDiff(originalLabel.minusStructure, label.minusStructure)
                                      : label.minusStructure || "-"}
                                  </TableCell>
                                </>
                              ) : (
                                <TableCell className="whitespace-pre">
                                  {highlightDifferences && originalLabel?.rowItems?.[0]
                                    ? highlightDiff(originalLabel.rowItems[0], label.rowItems?.[0])
                                    : label.rowItems?.[0] || "-"}
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <ScrollArea className="h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Grup Etiketi</TableHead>
                    {labelType === "DeviceBMK" ? (
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
                  {filteredLabels?.map((label, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{label.groupLabel}</TableCell>
                      {labelType === "DeviceBMK" ? (
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
                    {filteredLabels?.map((label, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="border border-gray-300 p-2 whitespace-pre">
                          {labelType === "DeviceBMK" ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                        </td>
                        <td className="border border-gray-300 p-2 whitespace-pre">
                          {labelType === "DeviceBMK" ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                        </td>
                        <td className="border border-gray-300 p-2 whitespace-pre">
                          {labelType === "DeviceBMK" ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                        </td>
                        <td className="border border-gray-300 p-2 whitespace-pre">
                          {labelType === "DeviceBMK" ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                        </td>
                        <td className="border border-gray-300 p-2 whitespace-pre">
                          {labelType === "DeviceBMK" ? label.mergedValue || "-" : label.rowItems?.[0] || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="changes" className="mt-0">
            <ScrollArea className="h-[60vh]">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Değişiklik Özeti</h3>

                {originalLabels && labels && (
                  <div className="space-y-6">
                    {/* Summary statistics */}
                    <div className="flex gap-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm text-gray-500">Toplam Etiket</div>
                        <div className="text-2xl font-semibold">{labels.length}</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-md">
                        <div className="text-sm text-yellow-700">Değişen Etiket</div>
                        <div className="text-2xl font-semibold">
                          {labels.filter((label, i) => hasLabelChanged(originalLabels[i], label, i)).length}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="text-sm text-green-700">Aynı Kalan Etiket</div>
                        <div className="text-2xl font-semibold">
                          {labels.filter((label, i) => !hasLabelChanged(originalLabels[i], label, i)).length}
                        </div>
                      </div>
                    </div>

                    {/* Changed labels list */}
                    <div>
                      <h4 className="font-medium mb-2">Değişen Etiketler</h4>
                      <div className="border rounded-md">
                        {labels.some((label, i) => hasLabelChanged(originalLabels[i], label, i)) ? (
                          labels
                            .map((label, i) => ({ label, originalLabel: originalLabels[i], index: i }))
                            .filter(({ label, originalLabel }) => hasLabelChanged(originalLabel, label))
                            .map(({ label, originalLabel, index }) => (
                              <div key={index} className="border-b last:border-b-0 p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="font-medium">Etiket #{index + 1}</div>
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                                    Değiştirildi
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm text-gray-500 mb-1">Orijinal</div>
                                    <div className="bg-gray-50 p-2 rounded">
                                      {labelType === "DeviceBMK" ? (
                                        <div>
                                          <div>
                                            <span className="font-medium">Grup:</span> {originalLabel.groupLabel}
                                          </div>
                                          <div>
                                            <span className="font-medium">Eşit:</span>{" "}
                                            {originalLabel.equalsStructure || "-"}
                                          </div>
                                          <div>
                                            <span className="font-medium">Artı:</span>{" "}
                                            {originalLabel.plusStructure || "-"}
                                          </div>
                                          <div>
                                            <span className="font-medium">Eksi:</span>{" "}
                                            {originalLabel.minusStructure || "-"}
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div>
                                            <span className="font-medium">Grup:</span> {originalLabel.groupLabel}
                                          </div>
                                          <div>
                                            <span className="font-medium">Etiket:</span>{" "}
                                            {originalLabel.rowItems?.[0] || "-"}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 mb-1">Manipüle Edilmiş</div>
                                    <div className="bg-yellow-50 p-2 rounded">
                                      {labelType === "DeviceBMK" ? (
                                        <div>
                                          <div>
                                            <span className="font-medium">Grup:</span>
                                            {originalLabel.groupLabel !== label.groupLabel ? (
                                              <span className="bg-yellow-100 px-1 ml-1 rounded">
                                                {label.groupLabel}
                                              </span>
                                            ) : (
                                              <span className="ml-1">{label.groupLabel}</span>
                                            )}
                                          </div>
                                          <div>
                                            <span className="font-medium">Eşit:</span>
                                            {originalLabel.equalsStructure !== label.equalsStructure ? (
                                              <span className="bg-yellow-100 px-1 ml-1 rounded">
                                                {label.equalsStructure || "-"}
                                              </span>
                                            ) : (
                                              <span className="ml-1">{label.equalsStructure || "-"}</span>
                                            )}
                                          </div>
                                          <div>
                                            <span className="font-medium">Artı:</span>
                                            {originalLabel.plusStructure !== label.plusStructure ? (
                                              <span className="bg-yellow-100 px-1 ml-1 rounded">
                                                {label.plusStructure || "-"}
                                              </span>
                                            ) : (
                                              <span className="ml-1">{label.plusStructure || "-"}</span>
                                            )}
                                          </div>
                                          <div>
                                            <span className="font-medium">Eksi:</span>
                                            {originalLabel.minusStructure !== label.minusStructure ? (
                                              <span className="bg-yellow-100 px-1 ml-1 rounded">
                                                {label.minusStructure || "-"}
                                              </span>
                                            ) : (
                                              <span className="ml-1">{label.minusStructure || "-"}</span>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div>
                                            <span className="font-medium">Grup:</span>
                                            {originalLabel.groupLabel !== label.groupLabel ? (
                                              <span className="bg-yellow-100 px-1 ml-1 rounded">
                                                {label.groupLabel}
                                              </span>
                                            ) : (
                                              <span className="ml-1">{label.groupLabel}</span>
                                            )}
                                          </div>
                                          <div>
                                            <span className="font-medium">Etiket:</span>
                                            {originalLabel.rowItems?.[0] !== label.rowItems?.[0] ? (
                                              <span className="bg-yellow-100 px-1 ml-1 rounded">
                                                {label.rowItems?.[0] || "-"}
                                              </span>
                                            ) : (
                                              <span className="ml-1">{label.rowItems?.[0] || "-"}</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Değişiklik bulunamadı. Tüm etiketler aynı kalmış.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
