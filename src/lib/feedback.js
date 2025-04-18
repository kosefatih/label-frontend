import { toast } from "react-toastify"

const defaultOptions = {
  position: "top-right",
  autoClose: 1500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export function showFeedback(type, message, options) {
  const operation = options?.operation ? `${options.operation}: ` : ""
  const fullMessage = `${operation}${message}`

  const toastOptions = {
    ...defaultOptions,
    autoClose: options?.duration || defaultOptions.autoClose,
  }

  switch (type) {
    case "success":
      toast.success(fullMessage, toastOptions)
      break
    case "error":
      toast.error(fullMessage, toastOptions)
      break
    case "info":
      toast.info(fullMessage, toastOptions)
      break
    case "warning":
      toast.warning(fullMessage, toastOptions)
      break
  }
}
