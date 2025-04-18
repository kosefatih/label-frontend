"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Örnek veri - gerçek uygulamada API'den gelecek
const sampleData = [
  { id: 1, name: "Rapor 2023-Q1", status: "tamamlandı", date: "2023-03-31", type: "excel" },
  { id: 2, name: "Rapor 2023-Q2", status: "tamamlandı", date: "2023-06-30", type: "excel" },
  { id: 3, name: "Rapor 2023-Q3", status: "işleniyor", date: "2023-09-30", type: "excel" },
  { id: 4, name: "Rapor 2023-Q4", status: "bekliyor", date: "2023-12-31", type: "excel" },
  { id: 5, name: "Yıllık Özet 2023", status: "bekliyor", date: "2023-12-31", type: "pdf" },
]

export function DataListing() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        // Gerçek uygulamada API'den veri çekilecek
        // const data = await fetchData("/api/reports")
        // setData(Array.isArray(data) ? data : [])

        // Şimdilik örnek veri kullanıyoruz
        setData(sampleData)
      } catch (err) {
        console.error("Veriler yüklenirken hata:", err)
        setError("Veriler yüklenemedi")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtreleme fonksiyonu
  const filteredData = data.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Durum badge'i için renk belirleme
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "tamamlandı":
        return "success"
      case "işleniyor":
        return "warning"
      case "bekliyor":
        return "secondary"
      default:
        return "default"
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Yükleniyor...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Veri Listesi</CardTitle>
        <CardDescription>Sistemdeki tüm raporlar ve dosyalar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="w-full md:w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="tamamlandı">Tamamlandı</SelectItem>
                <SelectItem value="işleniyor">İşleniyor</SelectItem>
                <SelectItem value="bekliyor">Bekliyor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <p className="text-center py-4">Hiç veri bulunamadı</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>İsim</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
