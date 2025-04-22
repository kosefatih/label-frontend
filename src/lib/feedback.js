import { toast } from "react-toastify"
import { ToastContent } from "@/components/toast-content" // Yeni bir bileşen oluşturacağız

const defaultOptions = {
  position: "top-right",
  autoClose: 1500, // Hatalar için daha uzun süre
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export function showFeedback(type, message, options = {}) {
  const operation = options?.operation ? `${options.operation}: ` : ""
  
  const toastOptions = {
    ...defaultOptions,
    autoClose: options?.duration || (type === "error" ? 10000 : defaultOptions.autoClose),
  }

  // Özel içerik için
  if (options?.products?.length) {
    toastOptions.render = (
      <ToastContent 
        type={type}
        message={`${operation}${message}`}
        products={options.products}
        errorDetails={options.errorDetails}
      />
    )
    toastOptions.autoClose = false // Ürün listesi varsa otomatik kapanmasın
  } else {
    toastOptions.render = `${operation}${message}`
  }

  switch (type) {
    case "success":
      toast.success(toastOptions.render || `${operation}${message}`, toastOptions)
      break
    case "error":
      toast.error(toastOptions.render || `${operation}${message}`, toastOptions)
      break
    case "info":
      toast.info(toastOptions.render || `${operation}${message}`, toastOptions)
      break
    case "warning":
      toast.warning(toastOptions.render || `${operation}${message}`, toastOptions)
      break
  }
}