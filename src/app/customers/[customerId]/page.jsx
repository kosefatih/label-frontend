import { PageHeader } from "@/components/page-header"
import ProjectList from "@/components/project-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function CustomerPage({ params, searchParams }) {
  // Next.js App Router'da params ve searchParams artık doğrudan kullanılabilir
  const customerId = params.customerId
  const customerCode = searchParams.code

  if (!customerCode) {
    throw new Error("Müşteri kodu bulunamadı")
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Müşterilere Dön
          </Button>
        </Link>
        <PageHeader title={`${customerCode} - Projeler`} description={`${customerCode} müşterisine ait tüm projeler`} />
      </div>
      <ProjectList customerId={customerId} customerCode={customerCode} />
    </div>
  )
}
