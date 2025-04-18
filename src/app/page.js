"use client"
import { useState, useEffect } from "react"
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
} from "../lib/api"
import UploadForm from "../components/upload-form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppLayout } from "@/components/app-layout"
import { UICard } from "@/components/ui-card"
import { UIListItem } from "@/components/ui-list-item"
import { LoadingButton } from "@/components/loading-button"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { showFeedback } from "@/lib/feedback"

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


  const parseLabelError = (error) => {
    if (!error.response?.data) return null;
    
    try {
      // Response'un string olma durumuna karşı kontrol
      const errorData = typeof error.response.data === 'string' 
        ? JSON.parse(error.response.data) 
        : error.response.data;
  
      const errorParts = errorData.Message.split('&-&');
      
      return {
        status: errorData.Status,
        mainMessage: errorParts[0].trim(),
        module: errorParts[1]?.replace('Hatanın oluştuğu modül:', '').trim(),
        repository: errorParts[2]?.replace('İstek gönderilen repository:', '').trim(),
        exceptionType: errorData.Data,
        products: errorParts[3]?.replace('Kategorisi(leri) tanımlı olmayan cihaz listesi:-ProductCodes:-', '')
          .split('\n')
          .filter(p => p.trim())
      };
    } catch (e) {
      console.error('Error parsing error response:', e);
      return null;
    }
  };



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
      showFeedback("warning", "Lütfen bir kural seti seçin", { operation: "Kural uygulama" });
      return;
    }
  
    try {
      setLoading(true);
      const result = await applyRuleToLabel(
        selectedCustomer.code,
        selectedProject.code,
        selectedPano.code,
        listName,
        selectedRuleSet.id,
        false,
      );
      showFeedback("success", result, { operation: "Kural uygulama" });
    } catch (error) {
      // Hata response'unu parse et
      let errorMessage = error.message;
      let errorDetails = null;
      let productList = null;
  
      // Backend'den gelen JSON formatındaki hata
      if (error.response?.data) {
        try {
          const errorData = typeof error.response.data === 'string' 
            ? JSON.parse(error.response.data) 
            : error.response.data;
  
          // Hata mesajını parçalara ayır
          const messageParts = errorData.Message?.split('&-&') || [];
          
          errorDetails = {
            status: errorData.Status || error.response.status,
            mainMessage: messageParts[0]?.trim() || errorData.Message,
            module: messageParts[1]?.replace('Hatanın oluştuğu modül:', '').replace('The module where the error occurred:', '').trim(),
            repository: messageParts[2]?.replace('İstek gönderilen repository:', '').replace('The repository to which the request was sent:', '').trim(),
            exceptionType: errorData.Data,
          };
  
          // Ürün listesini çıkar
          if (messageParts[3]) {
            productList = messageParts[3]
              .replace('Kategorisi(leri) tanımlı olmayan cihaz listesi:-ProductCodes:-', '')
              .replace('List of devices without defined category(s):-ProductCodes:-', '')
              .split('\n')
              .filter(p => p.trim());
          }
  
          errorMessage = errorDetails.mainMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
      }
  
      // Console'a detaylı loglama
      console.groupCollapsed('%cAPI Error Details', 'color: red; font-weight: bold;');
      console.error('Endpoint:', `${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error('Status:', error.response?.status || 'No response');
      console.error('Message:', errorMessage);
      
      if (errorDetails) {
        console.group('Error Details');
        console.log('Module:', errorDetails.module);
        console.log('Repository:', errorDetails.repository);
        console.log('Exception:', errorDetails.exceptionType);
        console.groupEnd();
      }
  
      if (productList?.length) {
        console.group('%cInvalid Products (' + productList.length + ')', 'color: orange;');
        productList.forEach((product, index) => {
          console.log(`%c${index + 1}. ${product}`, 'color: #333;');
        });
        console.groupEnd();
      }
  
      console.log('Full error object:', error);
      console.groupEnd();
  
      // Kullanıcıya gösterilecek feedback
      showFeedback("error", errorMessage, {
        operation: "Kural uygulama",
        errorDetails: {
          ...errorDetails,
          products: productList,
          technicalMessage: `Modül: ${errorDetails?.module || 'Bilinmiyor'}\nRepository: ${errorDetails?.repository || 'Bilinmiyor'}`,
        },
        showDetailsButton: true // Detayları göster butonu ekle
      });
  
    } finally {
      setLoading(false);
    }
  };

    // Manipüle edilmiş listeleri getir
    const handleGetManipulatedLabels = async (listName) => {
      try {
        setLoading(true)
        const data = await getManipulatedLabels(selectedCustomer.code, selectedProject.code, selectedPano.code, listName)
        setManipulatedLists(data.applyedLists)
      } catch (error) {
        showFeedback("error", error.response?.data?.message || error.message, { operation: "Liste yükleme" })
      } finally {
        setLoading(false)
      }
    }

  const handleListLabels = async (listName, labelType) => {
    try {
      setLoading(true)
      const data = await getManipulatedLabels(selectedCustomer.code, selectedProject.code, selectedPano.code, listName)
      setManipulatedLists(data.applyedLists)
      showFeedback("success", "Manipüle edilmiş listeler yüklendi", { operation: "Liste yükleme" })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Liste yükleme" })
    } finally {
      setLoading(false)
    }
  }

  // Excel dosyasını indir
  const handleExportLabels = async (listName, labelType, applyedListName) => {
    try {
      setLoading(true)
      // Dosya adını ayarla
      const settings = {
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
    <AppLayout title="Etiket Yönetimi">
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
              {/* Ader BMKs */}
              {labels.aderBMKs?.length > 0 && (
                <div className="bg-gray-50 p-3 rounded">
                  <h3 className="font-medium text-blue-600">Ader BMKs</h3>
                  <ul className="mt-2 space-y-3">
                    {labels.aderBMKs.map((group, i) => (
                      <UIListItem
                        key={i}
                        title={`${group.listName} (${group.listRowCount} kayıt)`}
                        actions={
                          <>
                            <FeedbackDialog
                              title="Kural Seti Seçin"
                              trigger={
                                <Button size="sm" variant="outline">
                                  Etiket Çıkart
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

                            <FeedbackDialog
                            title="Manipüle Edilmiş Listeler"
                            trigger={
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleGetManipulatedLabels(group.listName)}
                              >
                                Listele
                              </Button>
                            }
                          >
                            {manipulatedLists.length > 0 ? (
                              <ul className="space-y-2">
                                {manipulatedLists.map((list, index) => (
                                  <li key={index} className="p-3 border rounded flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{list.applyedListName}</p>
                                      <p className="text-sm text-gray-600">
                                        {list.labelType} - {list.listRowCount} kayıt
                                      </p>
                                    </div>
                                    <LoadingButton
                                      size="sm"
                                      isLoading={loading}
                                      onClick={() =>
                                        handleExportLabels(group.listName, list.labelType, list.applyedListName)
                                      }
                                    >
                                      Çıktı Al
                                    </LoadingButton>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>Manipüle edilmiş liste bulunamadı</p>
                            )}
                          </FeedbackDialog>
                          </>
                        }
                      />
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
                      <UIListItem
                        key={i}
                        title={`${group.listName} (${group.listRowCount} kayıt)`}
                        actions={
                          <>
                            <FeedbackDialog
                              title="Kural Seti Seçin"
                              trigger={
                                <Button size="sm" variant="outline">
                                  Etiket Çıkart
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

                            <FeedbackDialog
                              title="Manipüle Edilmiş Listeler"
                              trigger={
                                <Button size="sm" variant="secondary">
                                  Listele
                                </Button>
                              }
                              onConfirm={() => handleGetManipulatedLabels(group.listName)}
                              confirmText="Listeyi Yenile"
                            >
                              {manipulatedLists.length > 0 ? (
                                <ul className="space-y-2">
                                  {manipulatedLists.map((list, index) => (
                                    <li key={index} className="p-3 border rounded flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{list.applyedListName}</p>
                                        <p className="text-sm text-gray-600">
                                          {list.labelType} - {list.listRowCount} kayıt
                                        </p>
                                      </div>
                                      <LoadingButton
                                        size="sm"
                                        isLoading={loading}
                                        onClick={() =>
                                          handleExportLabels(group.listName, list.labelType, list.applyedListName)
                                        }
                                      >
                                        Çıktı Al
                                      </LoadingButton>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>Manipüle edilmiş liste bulunamadı</p>
                              )}
                            </FeedbackDialog>
                          </>
                        }
                      />
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
                      <UIListItem
                        key={i}
                        title={`${group.listName} (${group.listRowCount} kayıt)`}
                        actions={
                          <>
                            <FeedbackDialog
                              title="Kural Seti Seçin"
                              trigger={
                                <Button size="sm" variant="outline">
                                  Etiket Çıkart
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

                            <FeedbackDialog
                              title="Manipüle Edilmiş Listeler"
                              trigger={
                                <Button size="sm" variant="secondary">
                                  Listele
                                </Button>
                              }
                              onConfirm={() => handleGetManipulatedLabels(group.listName)}
                              confirmText="Listeyi Yenile"
                            >
                              {manipulatedLists.length > 0 ? (
                                <ul className="space-y-2">
                                  {manipulatedLists.map((list, index) => (
                                    <li key={index} className="p-3 border rounded flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{list.applyedListName}</p>
                                        <p className="text-sm text-gray-600">
                                          {list.labelType} - {list.listRowCount} kayıt
                                        </p>
                                      </div>
                                      <LoadingButton
                                        size="sm"
                                        isLoading={loading}
                                        onClick={() =>
                                          handleExportLabels(group.listName, list.labelType, list.applyedListName)
                                        }
                                      >
                                        Çıktı Al
                                      </LoadingButton>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>Manipüle edilmiş liste bulunamadı</p>
                              )}
                            </FeedbackDialog>
                          </>
                        }
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </UICard>
      </div>

      {/* --- Excel Yükleme Formu --- */}
      {selectedPano && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Excelden Etiket Yükle</h2>
          <UploadForm
            customerCode={selectedCustomer.code}
            projectCode={selectedProject.code}
            panoCode={selectedPano.code}
          />
        </div>
      )}
    </AppLayout>
  )
}
