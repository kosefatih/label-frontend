import { toast } from "react-toastify"

export function parseDetailedError(error) {
  const rawMessage = error.response?.data?.message || error.message

  // Eğer özel formatlı backend hatasıysa
  if (rawMessage.includes("&-&")) {
    const parts = rawMessage.split("&-&")
    const summary = parts[0]?.trim() || "Bilinmeyen hata" // Kısa özet
    const moduleInfo = parts[1]?.trim()
    const repositoryInfo = parts[2]?.trim()
    const detailedList = parts[3]?.trim()

    // Detaylı listeyi array'e çevir
    const detailedItems = detailedList
      ? detailedList.split("-").filter((item) => item.trim().length > 0)
      : []

    // Konsola detaylı log yaz
    console.error("[Detaylı Hata Mesajı]")
    console.error("✔️ Özet:", summary)
    console.error("📦 Modül:", moduleInfo)
    console.error("📁 Repository:", repositoryInfo)
    console.error("📋 Detaylı Liste:\n" + detailedItems.join("\n"))

    return {
      summary,
      moduleInfo,
      repositoryInfo,
      detailedList: detailedItems,
    }
  }

  // Standart hata mesajı
  return {
    summary: rawMessage,
  }
}

export function showErrorFeedback(error, operation) {
  const errorDetails = parseDetailedError(error)

  // Kısa özeti toast ile göster
  toast.error(`${operation ? `${operation}: ` : ""}${errorDetails.summary}`, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  })

  return errorDetails
}
