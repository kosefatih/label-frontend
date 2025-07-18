import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function parseLabelError(error) {
  if (!error.response?.data) return null

  try {
    const errorData = typeof error.response.data === "string" ? JSON.parse(error.response.data) : error.response.data
    const errorParts = errorData.Message.split("&-&")

    // Helper function to clean up product codes
    const cleanProductCodes = (productCodesStr) => {
      if (!productCodesStr) return []

      // Remove the ProductCodes prefix and any trailing dashes
      const cleanStr = productCodesStr
        .replace(/.*?-ProductCodes:-/, "") // Remove everything up to and including "-ProductCodes:-"
        .replace(/-+$/, "") // Remove all trailing dashes
        .trim()

      // Split by newline and filter out empty lines
      const products = cleanStr
        .split("\n")
        .map((line) => line.trim())
        .filter((p) => p && p.length > 0) // Filter out empty lines

      return products
    }

    // Parse different error types
    let productList = []

    if (errorParts[3]) {
      if (errorData.Data === "CategoryNotDefinedException") {
        // For category not defined errors - parse structured product data
        const productCodesStr = errorParts[3].replace("List of devices without defined category(s):", "").trim()
        const rawProducts = cleanProductCodes(productCodesStr)

        productList = rawProducts
          .map((productCode) => {
            const parts = productCode.split("/")
            if (parts.length >= 4) {
              return {
                eplanId: parts[0] || "",
                producerName: parts[1] || "",
                producerCode: (parts[2] || "").split(".")[0], // Remove the part after the dot
                productNumber: parts[2] || "",
                orderNumber: parts[3] || "",
              }
            }
            return null
          })
          .filter(Boolean)
      } else if (errorData.Data === "ItemNotExistException") {
        // For item not exist errors - just return the product codes as strings
        const productCodesStr = errorParts[3].replace("Defination(s) sent in the request:", "").trim()
        productList = cleanProductCodes(productCodesStr)
      }
    }

    return {
      status: errorData.Status,
      mainMessage: errorParts[0].trim(),
      module: errorParts[1]?.replace("The module where the error occurred:", "").trim(),
      repository: errorParts[2]?.replace("The repository to which the request was sent:", "").trim(),
      exceptionType: errorData.Data,
      products: productList,
    }
  } catch (e) {
    console.error("Error parsing error response:", e)
    return null
  }
}
