import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseLabelError(error) {
  if (!error.response?.data) return null;
  try {
    const errorData = typeof error.response.data === "string" ? JSON.parse(error.response.data) : error.response.data;
    const errorParts = errorData.Message.split("&-&");
    return {
      status: errorData.Status,
      mainMessage: errorParts[0].trim(),
      module: errorParts[1]?.replace("Hatanın oluştuğu modül:", "").trim(),
      repository: errorParts[2]?.replace("İstek gönderilen repository:", "").trim(),
      exceptionType: errorData.Data,
      products: errorParts[3]
        ?.replace("Kategorisi(leri) tanımlı olmayan cihaz listesi:-ProductCodes:-", "")
        .split("\n")
        .filter((p) => p.trim()),
    };
  } catch (e) {
    console.error("Error parsing error response:", e);
    return null;
  }
}