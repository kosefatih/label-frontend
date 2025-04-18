"use client"

import { useState, useEffect } from "react"
import { fetchCustomers } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getCustomers = async () => {
      try {
        setLoading(true)
        const data = await fetchCustomers()
        setCustomers(data)
      } catch (err) {
        console.error("Müşteriler yüklenirken hata:", err)
        setError("Müşteriler yüklenemedi. Lütfen daha sonra tekrar deneyin.")
      } finally {
        setLoading(false)
      }
    }

    getCustomers()
  }, [])

  const handleCustomerClick = (customerId, customerCode) => {
    // URL'de ID kullanıyoruz ama API çağrısı için kodu da gönderiyoruz
    router.push(`/customers/${customerId}?code=${customerCode}`)
  }

  if (loading) {
    return <div className="text-center py-10">Müşteriler yükleniyor...</div>
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div>
  }

  if (customers.length === 0) {
    return <div className="text-center py-10">Henüz müşteri bulunmamaktadır.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <Card key={customer.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h3 className="font-medium text-lg">{customer.name}</h3>
              {customer.code && <p className="text-gray-500 text-sm">Kod: {customer.code}</p>}
              <p className="text-sm mt-2">
                <span className="font-medium">Proje Sayısı:</span> {customer.projectCount || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Oluşturulma: {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button className="mt-4 w-full" onClick={() => handleCustomerClick(customer.id, customer.code)}>
              Projeleri Görüntüle
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
