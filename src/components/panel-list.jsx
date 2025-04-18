"use client"

import { useState, useEffect } from "react"
import { fetchPanels } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, BarChart2, PieChart, LineChart, TableIcon } from "lucide-react"

export default function PanelList({ customerId, projectId, customerCode, projectCode }) {
  const [panels, setPanels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getPanels = async () => {
      try {
        setLoading(true)
        // Müşteri ve proje kodlarını kullanarak panoları çek
        const data = await fetchPanels(customerCode, projectCode)
        setPanels(data)
      } catch (err) {
        console.error("Panolar yüklenirken hata:", err)
        setError("Panolar yüklenemedi. Lütfen daha sonra tekrar deneyin.")
      } finally {
        setLoading(false)
      }
    }

    if (customerCode && projectCode) {
      getPanels()
    } else {
      setError("Müşteri veya proje kodu bulunamadı. Lütfen ana sayfaya dönün ve tekrar deneyin.")
      setLoading(false)
    }
  }, [customerCode, projectCode])

  const getPanelIcon = (code) => {
    // Pano koduna göre ikon seçimi (örnek bir mantık)
    if (code?.startsWith("SC")) return <TableIcon className="h-5 w-5" />
    if (code?.startsWith("B")) return <BarChart2 className="h-5 w-5" />
    if (code?.startsWith("P")) return <PieChart className="h-5 w-5" />
    return <LineChart className="h-5 w-5" />
  }

  if (loading) {
    return <div className="text-center py-10">Panolar yükleniyor...</div>
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div>
  }

  if (panels.length === 0) {
    return <div className="text-center py-10">Bu projeye ait pano bulunmamaktadır.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {panels.map((panel) => (
        <Card key={panel.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {getPanelIcon(panel.code)}
                <CardTitle className="text-lg">{panel.name}</CardTitle>
              </div>
              {panel.code && (
                <Badge variant="outline" className="ml-2">
                  {panel.code}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {panel.description || "Bu pano için açıklama bulunmamaktadır."}
            </p>
            <div className="text-sm text-gray-500 mb-4">
              <p>Oluşturulma: {new Date(panel.createdAt).toLocaleDateString()}</p>
            </div>
            <Button className="w-full" onClick={() => window.open(`/dashboard/${panel.id}`, "_blank")}>
              Panoyu Görüntüle
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
