"use client"

import { useState, useEffect } from "react"
import { fetchProjects } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function ProjectList({ customerId, customerCode }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getProjects = async () => {
      try {
        setLoading(true)
        // Müşteri kodunu kullanarak projeleri çek
        const data = await fetchProjects(customerId, customerCode)
        setProjects(data)
      } catch (err) {
        console.error("Projeler yüklenirken hata:", err)
        setError("Projeler yüklenemedi. Lütfen daha sonra tekrar deneyin.")
      } finally {
        setLoading(false)
      }
    }

    if (customerCode) {
      getProjects()
    } else {
      setError("Müşteri kodu bulunamadı. Lütfen ana sayfaya dönün ve tekrar deneyin.")
      setLoading(false)
    }
  }, [customerId, customerCode])

  const handleProjectClick = (projectId, projectCode) => {
    // URL'de ID kullanıyoruz ama API çağrısı için kodu da gönderiyoruz
    router.push(
      `/customers/${customerId}/projects/${projectId}?customerCode=${customerCode}&projectCode=${projectCode}`,
    )
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Aktif", variant: "success" },
      pending: { label: "Beklemede", variant: "warning" },
      completed: { label: "Tamamlandı", variant: "default" },
      cancelled: { label: "İptal", variant: "destructive" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "secondary" }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return <div className="text-center py-10">Projeler yükleniyor...</div>
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div>
  }

  if (projects.length === 0) {
    return <div className="text-center py-10">Bu müşteriye ait proje bulunmamaktadır.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{project.name}</h3>
                {project.status && getStatusBadge(project.status)}
              </div>
              {project.code && <p className="text-gray-500 text-sm">Kod: {project.code}</p>}
              {project.description && <p className="text-gray-600 text-sm mb-2">{project.description}</p>}
              <div className="text-sm text-gray-500 space-y-1 mt-2">
                <p>Pano Sayısı: {project.panoCount || 0}</p>
                <p>Oluşturulma: {new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => handleProjectClick(project.id, project.code)}>
              Panoları Görüntüle
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
