"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  getCustomers,
  createCustomer,
  getProjects,
  createProject,
  getPanos,
  createPano,
  getLabels,
  getRuleSets,
  applyRuleToLabel,
  getManipulatedLabels,
  exportLabelList,
  createMultipleDeviceDefines,
  deleteLabelList,
  getManipulatedLabelsbyId,
  getLabelList,
} from "../lib/api"
import UploadForm from "../components/upload-form"
import { Plus, Trash2, FilePlus, List, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppLayout } from "@/components/app-layout"
import { UICard } from "@/components/ui-card"
import { UIListItem } from "@/components/ui-list-item"
import { LoadingButton } from "@/components/loading-button"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { Switch } from "@/components/ui/switch"
import { showFeedback } from "@/lib/feedback"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ManipulatedLabelsPreview from "../components/manipulated-labels-preview"

export default function Home() {
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [panos, setPanos] = useState([])
  const [selectedPano, setSelectedPano] = useState(null)
  const [labels, setLabels] = useState(null)
  const [ruleSets, setRuleSets] = useState([])
  const [selectedRuleSet, setSelectedRuleSet] = useState(null)
  const [loading, setLoading] = useState(false)
  const [manipulatedLists, setManipulatedLists] = useState([])
  const [selectedManipulatedList, setSelectedManipulatedList] = useState(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [currentExportItem, setCurrentExportItem] = useState(null)
  const [errors, setErrors] = useState({})
  const [exportSettings, setExportSettings] = useState({
    aderBMKExportDetailSettings: {
      fileName: "",
      repeatCount: 4,
      labelRowCount: 12,
      exportType: "HeadEnd",
      hasIdentifierColumn: true,
      spaceAvaliable: false,
    },
    klemensBMKExportDetailSettings: {},
    deviceBMKExportSettings: {
      fileName: "",
      repeatCount: 0,
    },
  })
  const [newCustomer, setNewCustomer] = useState({
    code: "",
    name: "",
    description: "",
    address: "",
    phoneNumber: "",
    authorizationPerson: "",
  })
  const [newProject, setNewProject] = useState({
    code: "",
    name: "",
    description: "",
  })
  const [newPano, setNewPano] = useState({
    code: "",
    name: "",
    description: "",
  })
  const [deviceDefines, setDeviceDefines] = useState([
    {
      eplanId: "",
      category: "",
      productNumber: "",
      orderNumber: "",
      producerName: "",
      producerCode: "",
    },
  ])
  const [showDeviceDefineDialog, setShowDeviceDefineDialog] = useState(false)
  const [repeatCount, setRepeatCount] = useState(1)
  const [exportType, setExportType] = useState("HeadEnd")
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  const handleOpenExportDialog = (listName, labelType, applyedListName) => {
    setCurrentExportItem({ listName, labelType, applyedListName })
    setExportDialogOpen(true)
  }

const handlePreviewLabels = async (listName, labelType, applyedListName) => {
  try {
    // Sadece AderBMK tipi için çalışsın
    if (labelType !== "AderBMK") {
      showFeedback("warning", "Önizleme sadece AderBMK etiketleri için kullanılabilir", { 
        operation: "Önizleme" 
      });
      return;
    }

    setLoading(true);
    
    // Hem orijinal hem de manipüle edilmiş etiketleri al
    const [originalData, manipulatedData] = await Promise.all([
      getLabelList(selectedCustomer.code, selectedProject.code, selectedPano.code, listName),
      getManipulatedLabelsbyId(
        selectedCustomer.code,
        selectedProject.code,
        selectedPano.code,
        listName,
        applyedListName
      )
    ]);

    setPreviewData({
      customerName: selectedCustomer.name,
      projectName: selectedProject.name,
      panoName: selectedPano.name,
      listName,
      applyListName: applyedListName,
      labelType,
      labels: manipulatedData.labels,
      originalLabels: originalData.labels
    });
    
    setPreviewDialogOpen(true);
  } catch (error) {
    showFeedback("error", error.response?.data?.message || error.message, { 
      operation: "Önizleme yükleme" 
    });
  } finally {
    setLoading(false);
  }
};

  const handleDeviceDefineChange = (index, field, value) => {
    // Eğer field 'eplanId' ise ve '/' içeriyorsa hata ayarla
    if (field === "eplanId" && value.includes("/")) {
      setErrors((prev) => ({
        ...prev,
        [index]: "Eplan ID'de '/' karakteri kullanılamaz",
      }))
    } else {
      // Hata yoksa hata mesajını temizle
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })
    }

    // State'i güncelle
    const updatedDefines = [...deviceDefines]
    updatedDefines[index][field] = value
    setDeviceDefines(updatedDefines)
  }

  const addNewDeviceDefineRow = () => {
    setDeviceDefines([
      ...deviceDefines,
      {
        eplanId: "",
        category: "",
        productNumber: "",
        orderNumber: "",
        producerName: "",
        producerCode: "",
      },
    ])
  }

  const removeDeviceDefineRow = (index) => {
    if (deviceDefines.length <= 1) return
    const newDefines = [...deviceDefines]
    newDefines.splice(index, 1)
    setDeviceDefines(newDefines)
  }

  const handleSubmitDeviceDefines = async () => {
    // 1. Validasyon işlemleri
    const validationErrors = {}
    let hasError = false

    deviceDefines.forEach((define, index) => {
      // Eplan ID'de '/' kontrolü
      if (define.eplanId.includes("/")) {
        validationErrors[index] = "Eplan ID'de '/' karakteri kullanılamaz"
        hasError = true
      }

      // Eplan ID boş mu kontrolü (opsiyonel)
      if (!define.eplanId.trim()) {
        validationErrors[index] = validationErrors[index] || "Eplan ID zorunludur"
        hasError = true
      }
    })

    // 2. Hata varsa işlemi durdur
    if (hasError) {
      setErrors(validationErrors)

      // İlk hatalı alana odaklan ve scroll et
      const firstErrorIndex = Object.keys(validationErrors)[0]
      if (firstErrorIndex) {
        const element = document.getElementById(`eplanId-${firstErrorIndex}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          element.focus()
        }
      }

      showFeedback("error", "Lütfen formdaki hataları düzeltin", { operation: "Cihaz tanımları ekleme" })
      return
    }

    // 3. Validasyon başarılıysa API isteğini yap
    try {
      setLoading(true)
      await createMultipleDeviceDefines(deviceDefines)

      // 4. Başarılı durumda formu resetle
      showFeedback("success", "Cihaz tanımları başarıyla eklendi", {
        operation: "Cihaz tanımları ekleme",
      })
      setShowDeviceDefineDialog(false)
      setDeviceDefines([
        {
          eplanId: "",
          category: "",
          productNumber: "",
          orderNumber: "",
          producerName: "",
          producerCode: "",
        },
      ])
      setErrors({}) // Hataları temizle
    } catch (error) {
      // 5. Hata durumunda kullanıcıyı bilgilendir
      showFeedback("error", error.response?.data?.message || error.message, {
        operation: "Cihaz tanımları ekleme",
      })
    } finally {
      setLoading(false)
    }
  }

  const parseLabelError = (error) => {
    if (!error.response?.data) return null

    try {
      // Response'un string olma durumuna karşı kontrol
      const errorData = typeof error.response.data === "string" ? JSON.parse(error.response.data) : error.response.data

      const errorParts = errorData.Message.split("&-&")

      return {
        status: errorData.Status,
        mainMessage: errorParts[0].trim(),
        module: errorParts[1]?.replace("Hatanın oluştuğu modül:", "").trim(),
        repository: errorParts[2]?.replace("İstek gönderilen repository:", "").trim(),
        exceptionType: errorData.Data,
        products: errorParts[3]
          ?.replace("Kategorisi(leri) tanımlı olmayan cihaz listesi:-ProductCodes:-", "")
          .split("\n")
          .filter((p) => p.trim()),
      }
    } catch (e) {
      console.error("Error parsing error response:", e)
      return null
    }
  }

  const handleExportWithSettings = async (repeatCount) => {
    if (!currentExportItem) return

    const { listName, labelType, applyedListName } = currentExportItem

    const exportSettings = {
      aderBMKExportDetailSettings: {
        fileName: applyedListName,
        repeatCount: labelType === "AderBMK" ? repeatCount : 4,
        labelRowCount: 12,
        exportType: "HeadEnd",
        hasIdentifierColumn: true,
        spaceAvaliable: false,
      },
      klemensBMKExportDetailSettings: {},
      deviceBMKExportSettings: {
        fileName: applyedListName,
        repeatCount: labelType === "DeviceBMK" ? repeatCount : 0,
      },
    }

    await handleExportLabels(listName, labelType, applyedListName, exportSettings)

    setExportDialogOpen(false)
  }

  // Müşterileri yükle
  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await getCustomers()
      setCustomers(data)
      showFeedback("success", "Müşteriler başarıyla yüklendi", { operation: "Veri yükleme" })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Veri yükleme" })
    } finally {
      setLoading(false)
    }
  }

  // Projeleri yükle
  const loadProjects = async (customer) => {
    try {
      setLoading(true)
      setSelectedCustomer(customer)
      setSelectedProject(null)
      setPanos([])
      setLabels(null)
      const data = await getProjects(customer.code)
      setProjects(data)
      showFeedback("success", `${customer.name} müşterisinin projeleri yüklendi`, { operation: "Veri yükleme" })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Veri yükleme" })
    } finally {
      setLoading(false)
    }
  }

  // Panoları yükle
  const loadPanos = async (project) => {
    try {
      setLoading(true)
      setSelectedProject(project)
      setSelectedPano(null)
      setLabels(null)
      if (!selectedCustomer) return
      const data = await getPanos(selectedCustomer.code, project.code)
      setPanos(data)
      showFeedback("success", `${project.name} projesinin panoları yüklendi`, { operation: "Veri yükleme" })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Veri yükleme" })
    } finally {
      setLoading(false)
    }
  }

  // Etiketleri yükle
  const loadLabels = async (pano) => {
    try {
      setLoading(true)
      setSelectedPano(pano)
      if (!selectedCustomer || !selectedProject) return
      const data = await getLabels(selectedCustomer.code, selectedProject.code, pano.code)
      setLabels(data)
      showFeedback("success", `${pano.code} panosunun etiketleri yüklendi`, { operation: "Veri yükleme" })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Veri yükleme" })
    } finally {
      setLoading(false)
    }
  }

  // Kural setlerini yükle
  const loadRuleSets = async () => {
    try {
      const data = await getRuleSets()
      setRuleSets(data)
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Kural setleri yükleme" })
    }
  }

  // Kural uygula
  const handleApplyRule = async (listName, labelType) => {
    if (!selectedRuleSet) {
      showFeedback("warning", "Lütfen bir kural seti seçin", { operation: "Kural uygulama" })
      return
    }

    try {
      setLoading(true)
      const result = await applyRuleToLabel(
        selectedCustomer.code,
        selectedProject.code,
        selectedPano.code,
        listName,
        selectedRuleSet.id,
        false,
      )
      showFeedback("success", result, { operation: "Kural uygulama" })
    } catch (error) {
      let errorMessage = error.message
      let errorDetails = null
      let productList = null

      if (error.response?.data) {
        try {
          const errorData =
            typeof error.response.data === "string" ? JSON.parse(error.response.data) : error.response.data

          const messageParts = errorData.Message?.split("&-&") || []

          errorDetails = {
            status: errorData.Status || error.response.status,
            mainMessage: messageParts[0]?.trim() || errorData.Message,
            module: messageParts[1]?.replace("Hatanın oluştuğu modül:", "").trim(),
            repository: messageParts[2]?.replace("İstek gönderilen repository:", "").trim(),
            exceptionType: errorData.Data,
          }

          if (messageParts[3]) {
            productList = messageParts[3]
              .replace("Kategorisi(leri) tanımlı olmayan cihaz listesi:-ProductCodes:-", "")
              .split("\n")
              .filter((p) => p.trim())
          }

          errorMessage = errorDetails.mainMessage
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }
      }

      // Kullanıcıya göster
      showFeedback("error", errorMessage, {
        operation: "Kural uygulama",
        products: productList,
        errorDetails: {
          ...errorDetails,
          technicalMessage: `Modül: ${errorDetails?.module || "Bilinmiyor"}\nRepository: ${errorDetails?.repository || "Bilinmiyor"}`,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  // Manipüle edilmiş listeleri getir
  const handleGetManipulatedLabels = async (listName) => {
    try {
      setLoading(true)
      const data = await getManipulatedLabels(selectedCustomer.code, selectedProject.code, selectedPano.code, listName)
      setManipulatedLists(data.applyedLists)
    } catch (error) {
      let errorMessage = error.message
      let errorDetails = null

      if (error.response?.data) {
        try {
          const errorData =
            typeof error.response.data === "string" ? JSON.parse(error.response.data) : error.response.data

          const messageParts = errorData.Message?.split("&-&") || []

          errorDetails = {
            status: errorData.Status || error.response.status,
            mainMessage: messageParts[0]?.trim() || errorData.Message,
            module: messageParts[1]
              ?.replace("Hatanın oluştuğu modül:", "")
              .replace("The module where the error occurred:", "")
              .trim(),
            repository: messageParts[2]
              ?.replace("İstek gönderilen repository:", "")
              .replace("The repository to which the request was sent:", "")
              .trim(),
            exceptionType: errorData.Data,
          }

          errorMessage = errorDetails.mainMessage
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }
      }

      // Console log
      console.groupCollapsed("%cAPI Error Details", "color: red; font-weight: bold;")
      console.error("Endpoint:", `${error.config?.method?.toUpperCase()} ${error.config?.url}`)
      console.error("Status:", error.response?.status || "No response")
      console.error("Message:", errorMessage)

      if (errorDetails) {
        console.group("Error Details")
        console.log("Module:", errorDetails.module)
        console.log("Repository:", errorDetails.repository)
        console.log("Exception:", errorDetails.exceptionType)
        console.groupEnd()
      }

      console.log("Full error object:", error)
      console.groupEnd()

      showFeedback("error", errorMessage, {
        operation: "Liste yükleme",
        errorDetails: {
          ...errorDetails,
          technicalMessage: `Modül: ${errorDetails?.module || "Bilinmiyor"}\nRepository: ${errorDetails?.repository || "Bilinmiyor"}`,
        },
        showDetailsButton: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Excel dosyasını indir
  const handleExportLabels = async (listName, labelType, applyedListName, customSettings = null) => {
    try {
      setLoading(true)

      // Özel ayarlar varsa onları kullan, yoksa mevcut exportSettings'i kullan
      const settings = customSettings || {
        ...exportSettings,
        [`${labelType}ExportSettings`]: {
          ...exportSettings[`${labelType}ExportSettings`],
          fileName: applyedListName,
        },
      }

      const response = await exportLabelList(
        selectedCustomer.code,
        selectedProject.code,
        selectedPano.code,
        listName,
        labelType,
        applyedListName,
        settings,
      )

      // Blob'dan dosya oluştur ve indir
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${applyedListName}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      showFeedback("success", "Excel dosyası indirildi", { operation: "Dosya indirme" })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Dosya indirme" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLabel = async (listName) => {
    try {
      setLoading(true)

      await deleteLabelList(selectedCustomer.code, selectedProject.code, selectedPano.code, listName)

      showFeedback("success", `${listName} listesi başarıyla silindi`, { operation: "Liste silme" })

      const updatedLabels = await getLabels(
        selectedCustomer.customerCode,
        selectedProject.projectCode,
        selectedPano.panoCode,
      )
      setLabels(updatedLabels)
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Liste silme" })
    } finally {
      setLoading(false)
    }
  }

  // Kural uygula ve çıktı al
  const handleApplyAndExport = async (listName, labelType) => {
    if (!selectedRuleSet) {
      showFeedback("warning", "Lütfen bir kural seti seçin", { operation: "Kural uygulama" })
      return
    }

    try {
      setLoading(true)

      // Önce kuralı uygula
      await applyRuleToLabel(
        selectedCustomer.code,
        selectedProject.code,
        selectedPano.code,
        listName,
        selectedRuleSet.id,
        false,
      )

      // Sonra çıktıyı al
      const applyedListName = `${listName}_${selectedRuleSet.name}`
      await handleExportLabels(listName, labelType, applyedListName)

      showFeedback("success", "Etiketler başarıyla oluşturuldu ve indirildi", { operation: "Etiket oluşturma" })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Etiket oluşturma" })
    } finally {
      setLoading(false)
    }
  }

  // Create new customer
  const handleCreateCustomer = async () => {
    try {
      setLoading(true)
      await createCustomer(newCustomer)
      showFeedback("success", `${newCustomer.name} müşterisi oluşturuldu`, { operation: "Müşteri oluşturma" })
      await loadCustomers()
      setNewCustomer({
        code: "",
        name: "",
        description: "",
        address: "",
        phoneNumber: "",
        authorizationPerson: "",
      })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Müşteri oluşturma" })
    } finally {
      setLoading(false)
    }
  }

  // Create new project
  const handleCreateProject = async () => {
    if (!selectedCustomer) return
    try {
      setLoading(true)
      await createProject(selectedCustomer.code, newProject)
      showFeedback("success", `${newProject.name} projesi oluşturuldu`, { operation: "Proje oluşturma" })
      await loadProjects(selectedCustomer)
      setNewProject({
        code: "",
        name: "",
        description: "",
      })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Proje oluşturma" })
    } finally {
      setLoading(false)
    }
  }

  // Create new pano
  const handleCreatePano = async () => {
    if (!selectedCustomer || !selectedProject) return
    try {
      setLoading(true)
      await createPano(selectedCustomer.code, selectedProject.code, newPano)
      showFeedback("success", `${newPano.code} panosu oluşturuldu`, { operation: "Pano oluşturma" })
      await loadPanos(selectedProject)
      setNewPano({
        code: "",
        name: "",
        description: "",
      })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Pano oluşturma" })
    } finally {
      setLoading(false)
    }
  }

  // Sayfa yüklendiğinde kural setlerini çek
  useEffect(() => {
    loadRuleSets()
  }, [])

  // Customer form component
  const CustomerForm = () => (
    <>
      <div>
        <Label>Kod</Label>
        <Input value={newCustomer.code} onChange={(e) => setNewCustomer({ ...newCustomer, code: e.target.value })} />
      </div>
      <div>
        <Label>Ad</Label>
        <Input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
      </div>
      <div>
        <Label>Açıklama</Label>
        <Input
          value={newCustomer.description}
          onChange={(e) => setNewCustomer({ ...newCustomer, description: e.target.value })}
        />
      </div>
      <div>
        <Label>Adres</Label>
        <Input
          value={newCustomer.address}
          onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
        />
      </div>
    </>
  )

  // Project form component
  const ProjectForm = () => (
    <>
      <div>
        <Label>Kod</Label>
        <Input value={newProject.code} onChange={(e) => setNewProject({ ...newProject, code: e.target.value })} />
      </div>
      <div>
        <Label>Ad</Label>
        <Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
      </div>
      <div>
        <Label>Açıklama</Label>
        <Input
          value={newProject.description}
          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
        />
      </div>
    </>
  )

  // Pano form component
  const PanoForm = () => (
    <>
      <div>
        <Label>Kod</Label>
        <Input value={newPano.code} onChange={(e) => setNewPano({ ...newPano, code: e.target.value })} />
      </div>
      <div>
        <Label>Ad</Label>
        <Input value={newPano.code} onChange={(e) => setNewPano({ ...newPano, name: e.target.value })} />
      </div>
      <div>
        <Label>Açıklama</Label>
        <Input value={newPano.description} onChange={(e) => setNewPano({ ...newPano, description: e.target.value })} />
      </div>
    </>
  )

  return (
    <AppLayout title="Etiket Manipülasyon Programı">
      <Button variant="outline" className="mb-4" onClick={() => setShowDeviceDefineDialog(true)}>
        Cihaz Tanımları Ekle
      </Button>
      <Button variant="outline" asChild>
        <Link href="/rules">Kurallar</Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Müşteriler */}
        <UICard
          title="Müşteriler"
          actionButton={
            <FeedbackDialog
              title="Yeni Müşteri Ekle"
              trigger={
                <Button size="sm" variant="outline">
                  Yeni Ekle
                </Button>
              }
              onConfirm={handleCreateCustomer}
            >
              <CustomerForm />
            </FeedbackDialog>
          }
        >
          <LoadingButton
            onClick={loadCustomers}
            isLoading={loading}
            loadingText="Yükleniyor..."
            className="w-full mb-4"
          >
            Müşterileri Yükle
          </LoadingButton>
          <div className="space-y-2">
            {customers.map((customer) => (
              <UIListItem
                key={customer.id}
                title={`${customer.name} (${customer.code})`}
                isSelected={selectedCustomer?.id === customer.id}
                onClick={() => loadProjects(customer)}
              />
            ))}
          </div>
        </UICard>

        {/* Projeler */}
        <UICard
          title="Projeler"
          actionButton={
            selectedCustomer && (
              <FeedbackDialog
                title="Yeni Proje Ekle"
                trigger={
                  <Button size="sm" variant="outline">
                    Yeni Ekle
                  </Button>
                }
                onConfirm={handleCreateProject}
              >
                <ProjectForm />
              </FeedbackDialog>
            )
          }
        >
          {selectedCustomer && (
            <div className="space-y-2">
              {projects.map((project) => (
                <UIListItem
                  key={project.id}
                  title={`${project.name} (${project.code})`}
                  isSelected={selectedProject?.id === project.id}
                  onClick={() => loadPanos(project)}
                />
              ))}
            </div>
          )}
        </UICard>

        {/* Panolar */}
        <UICard
          title="Panolar"
          actionButton={
            selectedProject && (
              <FeedbackDialog
                title="Yeni Pano Ekle"
                trigger={
                  <Button size="sm" variant="outline">
                    Yeni Ekle
                  </Button>
                }
                onConfirm={handleCreatePano}
              >
                <PanoForm />
              </FeedbackDialog>
            )
          }
        >
          {selectedProject && (
            <div className="space-y-2">
              {panos.map((pano) => (
                <UIListItem
                  key={pano.id}
                  title={`${pano.code} (${pano.code})`}
                  subtitle={pano.description}
                  isSelected={selectedPano?.id === pano.id}
                  onClick={() => loadLabels(pano)}
                />
              ))}
            </div>
          )}
        </UICard>

        {/* Etiketler */}
        <UICard title="Etiketler">
          {selectedPano && labels && (
            <div className="space-y-4">
            {/* Ader BMKs kısmında */}
            {labels.aderBMKs?.length > 0 && (
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-medium text-blue-600">Ader BMKs</h3>
                <ul className="mt-2 space-y-3">
                  {labels.aderBMKs.map((group, i) => (
                    <li key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{group.listName}</p>
                          <span className="text-sm text-gray-500">{group.listRowCount} kayıt</span>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FeedbackDialog
                                  title="Kural Seti Seçin"
                                  trigger={
                                    <Button size="sm" variant="outline" className="h-8 px-2">
                                      Kural Uygula
                                    </Button>
                                  }
                                  onConfirm={() => handleApplyRule(group.listName, "AderBMK")}
                                  confirmText="Kuralı Uygula"
                                >
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      {group.listName} listesi için kural seti seçin
                                    </p>
                                    <Select
                                      onValueChange={(value) =>
                                        setSelectedRuleSet(ruleSets.find((r) => r.id === Number.parseInt(value)))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Kural seti seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ruleSets
                                          .filter((r) => r.labelType === "AderBMK")
                                          .map((ruleSet) => (
                                            <SelectItem key={ruleSet.id} value={ruleSet.id.toString()}>
                                              {ruleSet.name} ({ruleSet.ruleCount} kural)
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </FeedbackDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Etiket Çıkart</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FeedbackDialog
                                  title="Manipüle Edilmiş Listeler"
                                  trigger={
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-8 px-2"
                                      onClick={() => handleGetManipulatedLabels(group.listName)}
                                    >
                                      Export
                                    </Button>
                                  }
                                  onConfirm={() => handleGetManipulatedLabels(group.listName)}
                                  confirmText="Listeyi Yenile"
                                  closeOnConfirm={false}
                                >
                                  {loading ? (
                                    <div className="flex justify-center py-8">
                                      <p>Yükleniyor...</p>
                                    </div>
                                  ) : manipulatedLists.length > 0 ? (
                                    <div className="space-y-3">
                                      {manipulatedLists.map((list, index) => (
                                        <div
                                          key={index}
                                          className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{list.applyedListName}</p>
                                            <p className="text-sm text-gray-600 truncate">
                                              {list.labelType} - {list.listRowCount} kayıt
                                            </p>
                                          </div>
                                          <div className="flex gap-2">
                                            {list.labelType === "AderBMK" && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                  handlePreviewLabels(
                                                    group.listName,
                                                    list.labelType,
                                                    list.applyedListName,
                                                  )
                                                }
                                              >
                                                <Eye className="h-4 w-4 mr-1" /> Önizle
                                              </Button>
                                            )}
                                            <Button
                                              size="sm"
                                              onClick={() => {
                                                setCurrentExportItem({
                                                  listName: group.listName,
                                                  labelType: list.labelType,
                                                  applyedListName: list.applyedListName,
                                                  defaultRepeatCount:
                                                    list.labelType === "DeviceBMK"
                                                      ? 0
                                                      : list.labelType === "AderBMK"
                                                        ? 4
                                                        : 1,
                                                })
                                                setRepeatCount(
                                                  list.labelType === "DeviceBMK"
                                                    ? 0
                                                    : list.labelType === "AderBMK"
                                                      ? 4
                                                      : 1,
                                                )
                                                setExportDialogOpen(true)
                                              }}
                                            >
                                              Çıktı Al
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-4 text-center text-gray-500">
                                      <p>Manipüle edilmiş liste bulunamadı</p>
                                    </div>
                                  )}
                                </FeedbackDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Listele</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FeedbackDialog
                                  title="Listeyi Sil"
                                  trigger={
                                    <Button size="sm" variant="destructive" className="h-8 px-2">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  }
                                  onConfirm={() => handleDeleteLabel(group.listName)}
                                  confirmText="Sil"
                                  cancelText="Vazgeç"
                                >
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                      {group.listName} listesini silmek üzeresiniz. Bu işlem geri alınamaz.
                                    </p>
                                    <p className="text-sm font-medium text-red-600">
                                      {group.listRowCount} kayıt silinecek.
                                    </p>
                                  </div>
                                </FeedbackDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sil</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Klemen BMKs */}
              {labels.klemenBMKs?.length > 0 && (
                <div className="bg-gray-50 p-3 rounded">
                  <h3 className="font-medium text-green-600">Klemen BMKs</h3>
                  <ul className="mt-2 space-y-3">
                    {labels.klemenBMKs.map((group, i) => (
                      <li key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{group.listName}</p>
                          <span className="text-sm text-gray-500">{group.listRowCount} kayıt</span>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FeedbackDialog
                                  title="Kural Seti Seçin"
                                  trigger={
                                    <Button size="sm" variant="outline" className="h-8 px-2">
                                      Kural Uygula
                                    </Button>
                                  }
                                  onConfirm={() => handleApplyRule(group.listName, "KlemensBMK")}
                                  confirmText="Kuralı Uygula"
                                >
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      {group.listName} listesi için kural seti seçin
                                    </p>
                                    <Select
                                      onValueChange={(value) =>
                                        setSelectedRuleSet(ruleSets.find((r) => r.id === Number.parseInt(value)))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Kural seti seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ruleSets
                                          .filter((r) => r.labelType === "KlemensBMK")
                                          .map((ruleSet) => (
                                            <SelectItem key={ruleSet.id} value={ruleSet.id.toString()}>
                                              {ruleSet.name} ({ruleSet.ruleCount} kural)
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </FeedbackDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Etiket Çıkart</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                            <FeedbackDialog
                              title="Manipüle Edilmiş Listeler"
                              trigger={
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 px-2"
                                  onClick={() => handleGetManipulatedLabels(group.listName)}
                                >
                                  Export
                                </Button>
                              }
                              onConfirm={() => handleGetManipulatedLabels(group.listName)}
                              confirmText="Listeyi Yenile"
                              closeOnConfirm={false}
                            >
                              {loading ? (
                                <div className="flex justify-center py-8">
                                  <p>Yükleniyor...</p>
                                </div>
                              ) : manipulatedLists.length > 0 ? (
                                <div className="space-y-3">
                                  {manipulatedLists.map((list, index) => (
                                    <div
                                      key={index}
                                      className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{list.applyedListName}</p>
                                        <p className="text-sm text-gray-600 truncate">
                                          {list.labelType} - {list.listRowCount} kayıt
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        {/* Sadece AderBMK tipi için önizleme butonunu göster */}
                                        {list.labelType === "AderBMK" && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              handlePreviewLabels(
                                                group.listName,
                                                list.labelType,
                                                list.applyedListName
                                              )
                                            }
                                          >
                                            <Eye className="h-4 w-4 mr-1" /> Önizle
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            setCurrentExportItem({
                                              listName: group.listName,
                                              labelType: list.labelType,
                                              applyedListName: list.applyedListName,
                                              defaultRepeatCount: list.labelType === "AderBMK" ? 4 : 1,
                                            })
                                            setRepeatCount(list.labelType === "AderBMK" ? 4 : 1)
                                            setExportDialogOpen(true)
                                          }}
                                        >
                                          Çıktı Al
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-4 text-center text-gray-500">
                                  <p>Manipüle edilmiş liste bulunamadı</p>
                                </div>
                              )}
                            </FeedbackDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Listele</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FeedbackDialog
                                  title="Listeyi Sil"
                                  trigger={
                                    <Button size="sm" variant="destructive" className="h-8 px-2">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  }
                                  onConfirm={() => handleDeleteLabel(group.listName)}
                                  confirmText="Sil"
                                  cancelText="Vazgeç"
                                >
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                      {group.listName} listesini silmek üzeresiniz. Bu işlem geri alınamaz.
                                    </p>
                                    <p className="text-sm font-medium text-red-600">
                                      {group.listRowCount} kayıt silinecek.
                                    </p>
                                  </div>
                                </FeedbackDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sil</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Device BMKs */}
              {labels.deviceBMKs?.length > 0 && (
                <div className="bg-gray-50 p-3 rounded">
                  <h3 className="font-medium text-purple-600">Device BMKs</h3>
                  <ul className="mt-2 space-y-3">
                    {labels.deviceBMKs.map((group, i) => (
                      <li key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{group.listName}</p>
                          <span className="text-sm text-gray-500">{group.listRowCount} kayıt</span>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FeedbackDialog
                                  title="Kural Seti Seçin"
                                  trigger={
                                    <Button size="sm" variant="outline" className="h-8 px-2">
                                      Kural Uygula
                                    </Button>
                                  }
                                  onConfirm={() => handleApplyRule(group.listName, "DeviceBMK")}
                                  confirmText="Kuralı Uygula"
                                >
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      {group.listName} listesi için kural seti seçin
                                    </p>
                                    <Select
                                      onValueChange={(value) =>
                                        setSelectedRuleSet(ruleSets.find((r) => r.id === Number.parseInt(value)))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Kural seti seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ruleSets
                                          .filter((r) => r.labelType === "DeviceBMK")
                                          .map((ruleSet) => (
                                            <SelectItem key={ruleSet.id} value={ruleSet.id.toString()}>
                                              {ruleSet.name} ({ruleSet.ruleCount} kural)
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </FeedbackDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Etiket Çıkart</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FeedbackDialog
                                  title="Manipüle Edilmiş Listeler"
                                  trigger={
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-8 px-2"
                                      onClick={() => handleGetManipulatedLabels(group.listName)}
                                    >
                                      Export
                                    </Button>
                                  }
                                  onConfirm={() => handleGetManipulatedLabels(group.listName)}
                                  confirmText="Listeyi Yenile"
                                  closeOnConfirm={false}
                                >
                                  {loading ? (
                                    <div className="flex justify-center py-8">
                                      <p>Yükleniyor...</p>
                                    </div>
                                  ) : manipulatedLists.length > 0 ? (
                                    <div className="space-y-3">
                                      {manipulatedLists.map((list, index) => (
                                        <div
                                          key={index}
                                          className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{list.applyedListName}</p>
                                            <p className="text-sm text-gray-600 truncate">
                                              {list.labelType} - {list.listRowCount} kayıt
                                            </p>
                                          </div>
                                          <div className="flex gap-2">
                                            {list.labelType === "AderBMK" && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                  handlePreviewLabels(
                                                    group.listName,
                                                    list.labelType,
                                                    list.applyedListName,
                                                  )
                                                }
                                              >
                                                <Eye className="h-4 w-4 mr-1" /> Önizle
                                              </Button>
                                            )}
                                            <Button
                                              size="sm"
                                              onClick={() => {
                                                setCurrentExportItem({
                                                  listName: group.listName,
                                                  labelType: list.labelType,
                                                  applyedListName: list.applyedListName,
                                                  defaultRepeatCount:
                                                    list.labelType === "DeviceBMK"
                                                      ? 0
                                                      : list.labelType === "AderBMK"
                                                        ? 4
                                                        : 1,
                                                })
                                                setRepeatCount(
                                                  list.labelType === "DeviceBMK"
                                                    ? 0
                                                    : list.labelType === "AderBMK"
                                                      ? 4
                                                      : 1,
                                                )
                                                setExportDialogOpen(true)
                                              }}
                                            >
                                              Çıktı Al
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-4 text-center text-gray-500">
                                      <p>Manipüle edilmiş liste bulunamadı</p>
                                    </div>
                                  )}
                                </FeedbackDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Listele</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FeedbackDialog
                                  title="Listeyi Sil"
                                  trigger={
                                    <Button size="sm" variant="destructive" className="h-8 px-2">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  }
                                  onConfirm={() => handleDeleteLabel(group.listName)}
                                  confirmText="Sil"
                                  cancelText="Vazgeç"
                                >
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                      {group.listName} listesini silmek üzeresiniz. Bu işlem geri alınamaz.
                                    </p>
                                    <p className="text-sm font-medium text-red-600">
                                      {group.listRowCount} kayıt silinecek.
                                    </p>
                                  </div>
                                </FeedbackDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sil</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Export Settings Dialog */}
              <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Çıktı Ayarları</DialogTitle>
                    <DialogDescription>
                      {currentExportItem?.applyedListName} için export ayarlarını yapılandırın
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fileName" className="text-right">
                        Dosya Adı
                      </Label>
                      <Input
                        id="fileName"
                        value={
                          exportSettings.aderBMKExportDetailSettings.fileName ||
                          currentExportItem?.applyedListName ||
                          ""
                        }
                        onChange={(e) =>
                          setExportSettings({
                            ...exportSettings,
                            aderBMKExportDetailSettings: {
                              ...exportSettings.aderBMKExportDetailSettings,
                              fileName: e.target.value,
                            },
                          })
                        }
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="repeatCount" className="text-right">
                        Tekrar Sayısı
                      </Label>
                      <Input
                        id="repeatCount"
                        type="number"
                        min="0"
                        value={exportSettings.aderBMKExportDetailSettings.repeatCount}
                        onChange={(e) =>
                          setExportSettings({
                            ...exportSettings,
                            aderBMKExportDetailSettings: {
                              ...exportSettings.aderBMKExportDetailSettings,
                              repeatCount: Number(e.target.value),
                            },
                          })
                        }
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="labelRowCount" className="text-right">
                        Etiket Satır Sayısı
                      </Label>
                      <Input
                        id="labelRowCount"
                        type="number"
                        min="1"
                        value={exportSettings.aderBMKExportDetailSettings.labelRowCount}
                        onChange={(e) =>
                          setExportSettings({
                            ...exportSettings,
                            aderBMKExportDetailSettings: {
                              ...exportSettings.aderBMKExportDetailSettings,
                              labelRowCount: Number(e.target.value),
                            },
                          })
                        }
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="exportType" className="text-right">
                        Export Tipi
                      </Label>
                      <Select
                        value={exportSettings.aderBMKExportDetailSettings.exportType}
                        onValueChange={(value) =>
                          setExportSettings({
                            ...exportSettings,
                            aderBMKExportDetailSettings: {
                              ...exportSettings.aderBMKExportDetailSettings,
                              exportType: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Export tipi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HeadEnd">HeadEnd</SelectItem>
                          <SelectItem value="Alphabethic">Alphabethic</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="hasIdentifierColumn" className="text-right">
                        Tanımlayıcı Kolonu
                      </Label>
                      <Switch
                        id="hasIdentifierColumn"
                        checked={exportSettings.aderBMKExportDetailSettings.hasIdentifierColumn}
                        onCheckedChange={(checked) =>
                          setExportSettings({
                            ...exportSettings,
                            aderBMKExportDetailSettings: {
                              ...exportSettings.aderBMKExportDetailSettings,
                              hasIdentifierColumn: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="spaceAvaliable" className="text-right">
                        Boşluk Kullanılabilir
                      </Label>
                      <Switch
                        id="spaceAvaliable"
                        checked={exportSettings.aderBMKExportDetailSettings.spaceAvaliable}
                        onCheckedChange={(checked) =>
                          setExportSettings({
                            ...exportSettings,
                            aderBMKExportDetailSettings: {
                              ...exportSettings.aderBMKExportDetailSettings,
                              spaceAvaliable: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <LoadingButton
                      isLoading={loading}
                      onClick={() => {
                        // Device BMK için ayarları da güncelle
                        const finalExportSettings = {
                          ...exportSettings,
                          deviceBMKExportSettings: {
                            fileName: currentExportItem?.applyedListName || "",
                            repeatCount: currentExportItem?.labelType === "DeviceBMK" ? repeatCount : 0,
                          },
                        }

                        handleExportLabels(
                          currentExportItem.listName,
                          currentExportItem.labelType,
                          currentExportItem.applyedListName,
                          finalExportSettings,
                        )

                        setExportDialogOpen(false)
                      }}
                    >
                      Çıktı Al
                    </LoadingButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </UICard>
      </div>

      {/* --- Excel Yükleme Formu --- */}
      {selectedPano && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Excel Etiket Listesi Yükle</h2>
          <UploadForm
            customerCode={selectedCustomer.code}
            projectCode={selectedProject.code}
            panoCode={selectedPano.code}
          />
        </div>
      )}
      <Dialog open={showDeviceDefineDialog} onOpenChange={setShowDeviceDefineDialog}>
        <DialogContent className="max-w-6xl w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Çoklu Cihaz Tanımı Ekle</DialogTitle>
            <DialogDescription>
              Aşağıdaki formu kullanarak birden fazla cihaz tanımı ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
            {deviceDefines.map((define, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                {/* 1. Sütun Grubu */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Eplan ID</Label>
                    <Input
                      id={`eplanId-${index}`}
                      value={define.eplanId}
                      onChange={(e) => handleDeviceDefineChange(index, "eplanId", e.target.value)}
                      className={`w-full h-10 ${errors[index] ? "border-red-500" : ""}`}
                    />
                    {errors[index] && <p className="text-red-500 text-sm">{errors[index]}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Kategori</Label>
                    <Input
                      value={define.category}
                      onChange={(e) => handleDeviceDefineChange(index, "category", e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                </div>

                {/* 2. Sütun Grubu */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Ürün Numarası</Label>
                    <Input
                      value={define.productNumber}
                      onChange={(e) => handleDeviceDefineChange(index, "productNumber", e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Sipariş Numarası</Label>
                    <Input
                      value={define.orderNumber}
                      onChange={(e) => handleDeviceDefineChange(index, "orderNumber", e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                </div>

                {/* 3. Sütun Grubu */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Üretici Adı</Label>
                    <Input
                      value={define.producerName}
                      onChange={(e) => handleDeviceDefineChange(index, "producerName", e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Üretici Kodu</Label>
                    <div className="flex gap-2">
                      <Input
                        value={define.producerCode}
                        onChange={(e) => handleDeviceDefineChange(index, "producerCode", e.target.value)}
                        className="flex-1 h-10"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeDeviceDefineRow(index)}
                        disabled={deviceDefines.length <= 1}
                        className="h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addNewDeviceDefineRow} className="h-12 text-md w-full">
              <Plus className="mr-2 h-5 w-5" /> Yeni Satır Ekle
            </Button>
          </div>

          <DialogFooter className="px-2 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setErrors({})
                setShowDeviceDefineDialog(false)
              }}
              className="h-12 px-6"
            >
              İptal
            </Button>
            <LoadingButton isLoading={loading} onClick={handleSubmitDeviceDefines} className="h-12 px-6 text-md">
              Kaydet
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {previewData && (
        <ManipulatedLabelsPreview
          customerName={previewData.customerName}
          projectName={previewData.projectName}
          panoName={previewData.panoName}
          listName={previewData.listName}
          applyListName={previewData.applyListName}
          labelType={previewData.labelType}
          labels={previewData.labels}
          originalLabels={previewData.originalLabels}
          isOpen={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
        />
      )}
    </AppLayout>
  )
}
