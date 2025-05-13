"use client"

import * as XLSX from "xlsx"

/**
 * Parse Excel file and convert it to a format compatible with the label preview
 * @param {File} file - The Excel file to parse
 * @param {Object} options - Parsing options
 * @returns {Promise<Array>} - Array of parsed labels
 */
export async function parseExcelForPreview(file, options) {
  if (!file) return []

  try {
    // Read the file
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    
    // Get the specified sheet or the first one
    const sheetName = options.sheetName || workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" })
    
    // Skip header rows if needed
    const startRow = options.startRow || 0
    const dataRows = jsonData.slice(startRow)
    
    // Process based on label type
    if (options.type === 1) { // AderBMK
      return processAderBMKData(dataRows, options)
    } else if (options.type === 2) { // KlemensBMK
      return processKlemensBMKData(dataRows, options)
    } else if (options.type === 3) { // DeviceBMK
      return processDeviceBMKData(dataRows, options)
    }
    
    return []
  } catch (error) {
    console.error("Excel parsing error:", error)
    return []
  }
}

/**
 * Process AderBMK data
 */
function processAderBMKData(rows, options) {
  const result = []
  const hasGroupLabel = options.aderHasGroup || false
  const groupLabelColumn = options.aderGroupCol || 0
  
  // Parse label columns
  let labelColumns = [0, 2] // Default
  if (options.aderLabelCols) {
    if (typeof options.aderLabelCols === 'string') {
      labelColumns = options.aderLabelCols.split(',').map(Number).filter(n => !isNaN(n))
    } else if (Array.isArray(options.aderLabelCols)) {
      labelColumns = options.aderLabelCols
    }
  }
  
  rows.forEach(row => {
    if (!row || row.length === 0) return
    
    const rowItems = labelColumns.map(colIndex => row[colIndex] || "")
    
    result.push({
      groupLabel: hasGroupLabel ? (row[groupLabelColumn] || "") : "",
      rowItems
    })
  })
  
  return result
}

/**
 * Process KlemensBMK data
 */
function processKlemensBMKData(rows, options) {
  const result = []
  const hasGroupLabel = options.klemensHasGroup || false
  const groupLabelColumn = options.klemensGroupCol || 0
  
  // Parse label columns
  let labelColumns = [1] // Default
  if (options.klemensLabelCols) {
    if (typeof options.klemensLabelCols === 'string') {
      labelColumns = options.klemensLabelCols.split(',').map(Number).filter(n => !isNaN(n))
    } else if (Array.isArray(options.klemensLabelCols)) {
      labelColumns = options.klemensLabelCols
    }
  }
  
  rows.forEach(row => {
    if (!row || row.length === 0) return
    
    const rowItems = labelColumns.map(colIndex => row[colIndex] || "")
    
    result.push({
      groupLabel: hasGroupLabel ? (row[groupLabelColumn] || "") : "",
      rowItems,
      productCode: row[options.klemensProductCode || 0] || "",
      width: row[options.klemensWidth || 0] || "",
      floor: row[options.klemensFloor || 0] || ""
    })
  })
  
  return result
}

/**
 * Process DeviceBMK data
 */
function processDeviceBMKData(rows, options) {
  const result = []
  
  rows.forEach(row => {
    if (!row || row.length === 0) return
    
    const equalsStructure = row[options.deviceEquals || 0] || ""
    const plusStructure = row[options.devicePlus || 0] || ""
    const minusStructure = row[options.deviceMinus || 0] || ""
    const mergedValue = row[options.deviceMerged || 0] || ""
    const productCode = row[options.deviceProduct || 0] || ""
    
    result.push({
      groupLabel: "", // DeviceBMK doesn't use group labels
      rowItems: [equalsStructure, plusStructure, minusStructure, mergedValue],
      productCode
    })
  })
  
  return result
}
