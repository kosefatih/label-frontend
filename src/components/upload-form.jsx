"use client"

import { useState } from "react"
import { uploadExcel } from "../lib/api"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { showFeedback } from "@/lib/feedback"
import { LoadingButton } from "./loading-button"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

const UploadForm = ({ customerCode, projectCode, panoCode }) => {
  // Form state
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [availableSheets, setAvailableSheets] = useState([])
  const [formValues, setFormValues] = useState({
    listName: "",
    sheetName: "",
    startRow: 2,
    type: 3,
    // AderBMK
    aderHasGroup: false,
    aderGroupCol: 4,
    aderLabelCols: "0,2",
    aderRotates: "1,3",
    // KlemensBMK
    klemensHasGroup: true,
    klemensGroupCol: 0,
    klemensLabelCols: "1",
    klemensProductCode: 2,
    klemensWidth: 3,
    klemensFloor: 4,
    // DeviceBMK
    deviceEquals: 0,
    devicePlus: 1,
    deviceMinus: 3,
    deviceMerged: 2,
    deviceProduct: 4,
  })
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [processingPreview, setProcessingPreview] = useState(false)

  // Handle file selection and read sheet names
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)

    try {
      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheets = workbook.SheetNames
      setAvailableSheets(sheets)

      // Otomatik olarak ilk sheet'i seç
      if (sheets.length > 0) {
        setFormValues((prev) => ({
          ...prev,
          sheetName: sheets[0],
        }))
      }
    } catch (error) {
      console.error("Excel dosyası okunurken hata:", error)
      showFeedback("error", "Excel dosyası okunurken hata oluştu", { operation: "Dosya okuma" })
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value) || 0 : value,
    }))
  }

  // Build the descModel object based on form values
  const buildDescModel = () => {
    const {
      type,
      listName,
      sheetName,
      startRow,
      aderHasGroup,
      aderGroupCol,
      aderLabelCols,
      aderRotates,
      klemensHasGroup,
      klemensGroupCol,
      klemensLabelCols,
      klemensProductCode,
      klemensWidth,
      klemensFloor,
      deviceEquals,
      devicePlus,
      deviceMinus,
      deviceMerged,
      deviceProduct,
    } = formValues

    return {
      ListName: listName,
      SheetName: sheetName,
      StartRowIndex: startRow,
      Type: type,
      AderBMKDetail: {
        IsAderBMK: type === 1,
        HasGroupLabel: type === 1 ? aderHasGroup : false,
        GroupLabelColumn: type === 1 ? aderGroupCol : 0,
        LabelColumns:
          type === 1 && aderLabelCols
            ? aderLabelCols
                .split(",")
                .map(Number)
                .filter((n) => !isNaN(n))
            : [],
        Rotates:
          type === 1 && aderRotates
            ? aderRotates
                .split(",")
                .map(Number)
                .filter((n) => !isNaN(n))
            : [],
      },
      KlemensBMKDetail: {
        IsKlemensBMK: type === 2,
        HasGroupLabel: type === 2 ? klemensHasGroup : false,
        GroupLabelColumn: type === 2 ? klemensGroupCol : 0,
        LabelColumns:
          type === 2 && klemensLabelCols
            ? klemensLabelCols
                .split(",")
                .map(Number)
                .filter((n) => !isNaN(n))
            : [],
        ProductCode: type === 2 ? klemensProductCode : 0,
        Width: type === 2 ? klemensWidth : 0,
        Floor: type === 2 ? klemensFloor : 0,
      },
      DeviceBMKDetail: {
        IsDeviceBMK: type === 3,
        EqualsStructureColumnNo: type === 3 ? deviceEquals : 0,
        PlusStructureColumnNo: type === 3 ? devicePlus : 0,
        MinusStructureColumnNo: type === 3 ? deviceMinus : 0,
        MergedColumnNo: type === 3 ? deviceMerged : 0,
        ProductCodeColumnNo: type === 3 ? deviceProduct : 0,
      },
    }
  }



  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!file) {
      showFeedback("error", "Lütfen bir dosya seçin", { operation: "Dosya yükleme" })
      return
    }
    if (!formValues.listName) {
      showFeedback("error", "Liste adı boş olamaz", { operation: "Dosya yükleme" })
      return
    }
    if (!formValues.sheetName) {
      showFeedback("error", "Sayfa adı boş olamaz", { operation: "Dosya yükleme" })
      return
    }

    try {
      setLoading(true)
      const descModel = buildDescModel()
      const person = localStorage.getItem("userId")

      await uploadExcel(person, customerCode, projectCode, panoCode, file, descModel)

      showFeedback("success", "Dosya başarıyla yüklendi!", { operation: "Dosya yükleme" })

      // Reset form
      setFile(null)
      setFormValues((prev) => ({
        ...prev,
        listName: "",
        sheetName: "",
      }))

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ""
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  // Error handling
  const handleError = (error) => {
    console.error("Yükleme hatası detayları:", {
      message: error.message,
      response: error.response,
      stack: error.stack,
      config: error.config,
    })

    if (error.response) {
      const { status, data } = error.response

      if (status === 413) {
        showFeedback("error", "Dosya boyutu çok büyük! Maksimum 10MB destekleniyor.", {
          operation: "Dosya yükleme",
          details: data,
        })
      } else if (status === 401) {
        showFeedback("error", "Yetkiniz yok, lütfen tekrar giriş yapın", {
          operation: "Dosya yükleme",
          details: data,
        })
      } else if (data?.message?.includes("listAlreadyExistMsg")) {
        showFeedback("error", "Bu liste adı zaten mevcut! Lütfen farklı bir liste adı deneyin.", {
          operation: "Dosya yükleme",
          details: data,
        })
      } else if (data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(data.errors).join("\n")
        showFeedback("error", `Doğrulama hataları:\n${errorMessages}`, {
          operation: "Dosya yükleme",
          details: data,
        })
      } else {
        showFeedback("error", data?.message || "Beklenmeyen bir hata oluştu", {
          operation: "Dosya yükleme",
          details: data,
        })
      }
    } else if (error.request) {
      showFeedback("error", "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.", {
        operation: "Dosya yükleme",
        details: error.request,
      })
    } else {
      showFeedback("error", error.message || "Beklenmeyen bir hata oluştu", {
        operation: "Dosya yükleme",
        details: error,
      })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold">Excel Dosyası Yükle</h2>

      {/* File Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Excel Dosyası</label>
        <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      </div>

      {/* Basic Information */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Liste Adı*</label>
        <Input
          name="listName"
          placeholder="Örnek: E511_DeviceBMKs"
          value={formValues.listName}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Sayfa Adı*</label>
        <Select
          value={formValues.sheetName}
          onValueChange={(value) => setFormValues((prev) => ({ ...prev, sheetName: value }))}
          disabled={availableSheets.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={availableSheets.length > 0 ? "Sayfa seçin" : "Önce dosya yükleyin"} />
          </SelectTrigger>
          <SelectContent>
            {availableSheets.map((sheet) => (
              <SelectItem key={sheet} value={sheet}>
                {sheet}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Başlangıç Satırı</label>
        <Input name="startRow" type="number" min="1" value={formValues.startRow} onChange={handleChange} />
      </div>

      {/* Label Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Etiket Tipi*</label>
        <Select
          value={formValues.type.toString()}
          onValueChange={(val) => setFormValues((prev) => ({ ...prev, type: Number(val) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Etiket tipi seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">AderBMK</SelectItem>
            <SelectItem value="2">KlemensBMK</SelectItem>
            <SelectItem value="3">DeviceBMK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conditional Fields Based on Selected Type */}
      {formValues.type === 1 && (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
          <h2 className="font-semibold text-lg">AderBMK Ayarları</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Grup Etiketi Var Mı?</label>
            <Select
              value={formValues.aderHasGroup.toString()}
              onValueChange={(val) => setFormValues((prev) => ({ ...prev, aderHasGroup: val === "true" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Evet</SelectItem>
                <SelectItem value="false">Hayır</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Grup Etiket Sütunu</label>
            <Input
              name="aderGroupCol"
              type="number"
              min="0"
              value={formValues.aderGroupCol}
              onChange={handleChange}
              disabled={!formValues.aderHasGroup}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Etiket Sütunları (virgülle ayırın)</label>
            <Input
              name="aderLabelCols"
              placeholder="Örnek: 0,2"
              value={formValues.aderLabelCols}
              onChange={handleChange}
            />
          </div>

          {/* Yeni eklenen Rotates alanı */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Döndürülecek Sütunlar (virgülle ayırın)</label>
            <Input
              name="aderRotates"
              placeholder="Örnek: 1,3"
              value={formValues.aderRotates}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      {formValues.type === 2 && (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
          <h2 className="font-semibold text-lg">KlemensBMK Ayarları</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Grup Etiketi Var Mı?</label>
            <Select
              value={formValues.klemensHasGroup.toString()}
              onValueChange={(val) => setFormValues((prev) => ({ ...prev, klemensHasGroup: val === "true" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Evet</SelectItem>
                <SelectItem value="false">Hayır</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Grup Etiket Sütunu</label>
            <Input
              name="klemensGroupCol"
              type="number"
              min="0"
              value={formValues.klemensGroupCol}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Etiket Sütunları (virgülle ayırın)</label>
            <Input
              name="klemensLabelCols"
              placeholder="Örnek: 1,3"
              value={formValues.klemensLabelCols}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Ürün Kodu Sütunu</label>
            <Input
              name="klemensProductCode"
              type="number"
              min="0"
              value={formValues.klemensProductCode}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Genişlik Sütunu</label>
            <Input name="klemensWidth" type="number" min="0" value={formValues.klemensWidth} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Kat Sütunu</label>
            <Input name="klemensFloor" type="number" min="0" value={formValues.klemensFloor} onChange={handleChange} />
          </div>
        </div>
      )}

      {formValues.type === 3 && (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
          <h2 className="font-semibold text-lg">DeviceBMK Ayarları</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Equals Structure Sütunu</label>
            <Input name="deviceEquals" type="number" min="0" value={formValues.deviceEquals} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Plus Structure Sütunu</label>
            <Input name="devicePlus" type="number" min="0" value={formValues.devicePlus} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Minus Structure Sütunu</label>
            <Input name="deviceMinus" type="number" min="0" value={formValues.deviceMinus} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Merged Sütunu</label>
            <Input name="deviceMerged" type="number" min="0" value={formValues.deviceMerged} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Ürün Kodu Sütunu</label>
            <Input
              name="deviceProduct"
              type="number"
              min="0"
              value={formValues.deviceProduct}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <LoadingButton className="flex-1 py-2" onClick={handleSubmit} isLoading={loading} loadingText="Yükleniyor...">
          Yükle
        </LoadingButton>
      </div>
    </div>
  )
}

export default UploadForm
