import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

export function ToastContent({ type, message, products, errorDetails }) {
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
          
          {products?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium">Geçersiz Ürünler ({products.length} adet):</p>
              <div className="max-h-40 overflow-y-auto mt-1 text-sm border rounded p-2 bg-gray-50">
                <ul className="space-y-1">
                  {products.map((product, index) => (
                    <li key={index} className="py-1 border-b last:border-b-0">
                      {index + 1}. {product}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}