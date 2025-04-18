import { PageHeader } from "@/components/page-header"
import PanelList from "@/components/panel-list"
import { getProjectById } from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function ProjectPage({ params, searchParams }) {
  // Next.js App Router'da params ve searchParams artık doğrudan kullanılabilir
  const customerId = params.customerId
  const projectId = params.projectId
  const customerCode = searchParams.customerCode
  const projectCode = searchParams.projectCode

  if (!projectId) {
    return <div>Proje ID bulunamadı</div>
  }

  if (!customerCode || !projectCode) {
    return <div>Müşteri veya proje kodu bulunamadı</div>
  }

  let project
  try {
    project = await getProjectById(projectId)
  } catch (error) {
    console.error("Proje bilgileri alınırken hata:", error)
    return <div>Proje bilgileri alınırken hata oluştu</div>
  }

  if (!project) {
    return <div>Proje bulunamadı</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href={`/customers/${customerId}?code=${customerCode}`}>
          <Button variant="outline" size="sm" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Projelere Dön
          </Button>
        </Link>
        <PageHeader
          title={`${project.name} - Panolar`}
          description={`${customerCode} müşterisinin ${project.name} projesine ait panolar`}
        />
      </div>
      <PanelList customerId={customerId} projectId={projectId} customerCode={customerCode} projectCode={projectCode} />
    </div>
  )
}
