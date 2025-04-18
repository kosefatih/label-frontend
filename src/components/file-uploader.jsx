"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { processExcelFile } from "@/lib/excel-processor"
import { cn } from "@/lib/utils"

export function FileUploader() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [excelData, setExcelData] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFileSelection(droppedFile)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      handleFileSelection(selectedFile)
    }
  }

  const handleFileSelection = (selectedFile) => {
    // Check if the file is an Excel file
    if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
      setError("Lütfen geçerli bir Excel dosyası (.xlsx veya .xls) yükleyin")
      return
    }

    setFile(selectedFile)
    setError(null)
    setSuccess(null)
    setExcelData(null)
  }

  const handleProcessFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setSuccess(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)

      // Process the Excel file
      const data = await processExcelFile(file)

      clearInterval(progressInterval)
      setProgress(100)
      setExcelData(data)
      setSuccess("Dosya başarıyla işlendi")
    } catch (err) {
      console.error("Dosya işlenirken hata:", err)
      setError("Dosya işlenirken bir hata oluştu")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitData = async () => {
    if (!excelData) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setSuccess(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 15
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)

      // Here you would send the data to your backend API
      // For example: await postData('/api/excel-import', { data: excelData })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      clearInterval(progressInterval)
      setProgress(100)
      setSuccess("Veriler başarıyla sisteme kaydedildi")

      // Reset after successful submission
      setTimeout(() => {
        setFile(null)
        setExcelData(null)
        setProgress(0)
      }, 2000)
    } catch (err) {
      console.error("Veriler gönderilirken hata:", err)
      setError("Veriler sisteme kaydedilirken bir hata oluştu")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Excel Dosyası Yükleme</CardTitle>
        <CardDescription>Excel dosyalarını yükleyin, içeriğini görüntüleyin ve işleyin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!file ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <h3 className="font-medium text-lg">Excel dosyanızı buraya sürükleyin</h3>
              <p className="text-sm text-muted-foreground">veya dosya seçmek için tıklayın</p>
              <p className="text-xs text-muted-foreground mt-2">Desteklenen formatlar: .xlsx, .xls</p>
              <Input id="file-upload" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setExcelData(null)
                  setError(null)
                  setSuccess(null)
                }}
              >
                Değiştir
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress < 100 ? "İşleniyor..." : "Tamamlandı"}
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Başarılı</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {excelData && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(excelData[0]).map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {excelData.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {excelData.length > 5 && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    {excelData.length - 5} daha fazla satır...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {file && !excelData && (
          <Button onClick={handleProcessFile} disabled={isProcessing}>
            {isProcessing ? "İşleniyor..." : "Dosyayı İşle"}
          </Button>
        )}
        {excelData && (
          <Button onClick={handleSubmitData} disabled={isProcessing}>
            {isProcessing ? "Kaydediliyor..." : "Verileri Kaydet"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}