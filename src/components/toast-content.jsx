import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

export function ToastContent({ type, message, errorDetails }) {
  const Icon = iconMap[type] || Info
  
  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${
          type === 'success' ? 'text-green-500' : 
          type === 'error' ? 'text-red-500' :
          type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
        }`} />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          
          {errorDetails?.technicalMessage && (
            <p className="text-sm mt-1 text-gray-600">{errorDetails.technicalMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}