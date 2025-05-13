"use client"

import { useState, useEffect } from "react"
import * as XLSX from "xlsx"

// Excel dosyasını işleyip önizleme için hazırlayan bileşen
const ExcelPreviewHandler = ({ file, sheetName, startRow, labelType, columnSettings, onDataReady, onError }) => {
  useEffect(() => {
    if (!file) return

    const processExcel = async () => {
      try {
        // Excel dosyasını oku
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data)
        
        // Belirtilen sayfayı al
        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) {
          onError(`"${sheetName}" sayfası bulunamadı.`)
          return
        }
        
        // JSON'a dönüştür
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" })
        
        // Başlangıç satırından itibaren verileri al
        const rows = jsonData.slice(startRow - 1)
        
        // Etiket tipine göre veriyi işle
        let processedData
        
        switch (labelType) {
          case 1: // AderBMK
            processedData = processAderBMK(rows, columnSettings)
            break
          case 2: // KlemensBMK
            processedData = processKlemensBMK(rows, columnSettings)
            break
          case 3: // DeviceBMK
            processedData = processDeviceBMK(rows, columnSettings)
            break
          default:
            processedData = { labels: rows.map(row => ({ originalRow: row })) }
        }
        
        onDataReady(processedData)
      } catch (error) {
        console.error("Excel işleme hatası:", error)
        onError("Excel dosyası işlenirken bir hata oluştu: " + error.message)
      }
    }
    
    processExcel()
  }, [file, sheetName, startRow, labelType, columnSettings, onDataReady, onError])
  
  // AderBMK verilerini işle
  const processAderBMK = (rows, settings) => {
    const { aderHasGroup, aderGroupCol, aderLabelCols } = settings
    
    // Etiket sütunlarını diziye dönüştür
    const labelColumns = aderLabelCols.split(",").map(Number).filter(n => !isNaN(n))
    
    // Her satır için etiketleri oluştur
    const labels = rows.map((row, index) => {
      // Grup etiketi
      const groupLabel = aderHasGroup ? row[aderGroupCol] || "" : ""
      
      // Etiket değerleri
      const labelValues = labelColumns.map(colIndex => row[colIndex] || "").filter(Boolean)
      
      return {
        id: index,
        groupLabel,
        labelText: labelValues.join(" "),
        originalRow: row
      }
    })
    
    return { labels }
  }
  
  // KlemensBMK verilerini işle
  const processKlemensBMK = (rows, settings) => {
    const { klemensHasGroup, klemensGroupCol, klemensLabelCols, klemensProductCode, klemensWidth, klemensFloor } = settings
    
    // Etiket sütunlarını diziye dönüştür
    const labelColumns = klemensLabelCols.split(",").map(Number).filter(n => !isNaN(n))
    
    // Her satır için etiketleri oluştur
    const labels = rows.map((row, index) => {
      // Grup etiketi
      const groupLabel = klemensHasGroup ? row[klemensGroupCol] || "" : ""
      
      // Etiket değerleri
      const labelValues = labelColumns.map(colIndex => row[colIndex] || "").filter(Boolean)
      
      return {
        id: index,
        groupLabel,
        labelText: labelValues.join(" "),
        productCode: row[klemensProductCode] || "",
        width: row[klemensWidth] || "",
        floor: row[klemensFloor] || "",
        originalRow: row
      }
    })
    
    return { labels }
  }
  
  // DeviceBMK verilerini işle
  const processDeviceBMK = (rows, settings) => {
    const { deviceEquals, devicePlus, deviceMinus, deviceMerged, deviceProduct } = settings
    
    // Her satır için etiketleri oluştur
    const labels = rows.map((row, index) => {
      return {
        id: index,
        equalsStructure: row[deviceEquals] || "",
        plusStructure: row[devicePlus] || "",
        minusStructure: row[deviceMinus] || "",
        mergedValue: row[deviceMerged] || "",
        productCode: row[deviceProduct] || "",
        originalRow: row
      }
    })
    
    return { labels }
  }
  
  return null
}

export default ExcelPreviewHandler
