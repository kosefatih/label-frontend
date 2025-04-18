"use client"

import { useState, useEffect } from 'react';
import { 
  getCustomers, createCustomer,
  getProjects, createProject,
  getPanos, createPano,
  getLabels, getRuleSets, applyRuleToLabel, 
  getManipulatedLabels, exportLabelList 
} from '../lib/api';
import UploadForm from '../components/upload-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'react-toastify';

export default function Home() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [panos, setPanos] = useState([]);
  const [selectedPano, setSelectedPano] = useState(null);
  const [labels, setLabels] = useState(null);
  const [ruleSets, setRuleSets] = useState([]);
  const [selectedRuleSet, setSelectedRuleSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manipulatedLists, setManipulatedLists] = useState([]);
  const [selectedManipulatedList, setSelectedManipulatedList] = useState(null);
  const [exportSettings, setExportSettings] = useState({
    aderBMKExportDetailSettings: {
      fileName: "",
      repeatCount: 4,
      labelRowCount: 12,
      exportType: "HeadEnd",
      hasIdentifierColumn: true,
      spaceAvaliable: false
    },
    klemensBMKExportDetailSettings: {},
    deviceBMKExportSettings: {
      fileName: "",
      repeatCount: 1
    }
  });
  const [newCustomer, setNewCustomer] = useState({
    code: "",
    name: "",
    description: "",
    address: "",
    phoneNumber: "",
    authorizationPerson: ""
  });
  const [newProject, setNewProject] = useState({
    code: "",
    name: "",
    description: ""
  });
  const [newPano, setNewPano] = useState({
    code: "",
    name: "",
    description: ""
  });

  // Müşterileri yükle
  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  // Projeleri yükle
  const loadProjects = async (customer) => {
    setSelectedCustomer(customer);
    setSelectedProject(null);
    setPanos([]);
    setLabels(null);
    const data = await getProjects(customer.code);
    setProjects(data);
  };

  // Panoları yükle
  const loadPanos = async (project) => {
    setSelectedProject(project);
    setSelectedPano(null);
    setLabels(null);
    if (!selectedCustomer) return;
    const data = await getPanos(selectedCustomer.code, project.code);
    setPanos(data);
  };

  // Etiketleri yükle
  const loadLabels = async (pano) => {
    setSelectedPano(pano);
    if (!selectedCustomer || !selectedProject) return;
    const data = await getLabels(selectedCustomer.code, selectedProject.code, pano.name);
    setLabels(data);
  };

    // Kural setlerini yükle
    const loadRuleSets = async () => {
      const data = await getRuleSets();
      setRuleSets(data);
    };
  
    // Kural uygula
    const handleApplyRule = async (listName, labelType) => {
      if (!selectedRuleSet) {
        toast.error("Lütfen bir kural seti seçin");
        return;
      }
  
      try {
        setLoading(true);
        const result = await applyRuleToLabel(
          selectedCustomer.code,
          selectedProject.code,
          selectedPano.name,
          listName,
          selectedRuleSet.id,
          false
        );
        toast.success(`Kural başarıyla uygulandı: ${result}`);
        // Etiketleri yeniden yükle
        await loadLabels(selectedPano);
      } catch (error) {
        toast.error(`Hata: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleListLabels = async (listName, labelType) => {
      try {
        const data = await getManipulatedLabels(
          selectedCustomer.code,
          selectedProject.code,
          selectedPano.name,
          listName
        );
        setManipulatedLists(data.applyedLists);
        toast.success("Manipüle edilmiş listeler yüklendi");
      } catch (error) {
        toast.error(`Hata: ${error.response?.data?.message || error.message}`);
      }
    };

      // Excel dosyasını indir
  const handleExportLabels = async (listName, labelType, applyedListName) => {
    try {
      // Dosya adını ayarla
      const settings = {
        ...exportSettings,
        [`${labelType}ExportSettings`]: {
          ...exportSettings[`${labelType}ExportSettings`],
          fileName: applyedListName
        }
      };

      const response = await exportLabelList(
        selectedCustomer.code,
        selectedProject.code,
        selectedPano.name,
        listName,
        labelType,
        applyedListName,
        settings
      );

      // Blob'dan dosya oluştur ve indir
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${applyedListName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Excel dosyası indirildi");
    } catch (error) {
      toast.error(`Hata: ${error.response?.data?.message || error.message}`);
    }
  };


    // Create new customer
    const handleCreateCustomer = async () => {
      try {
        await createCustomer(newCustomer);
        toast.success("Müşteri başarıyla oluşturuldu");
        await loadCustomers();
        setNewCustomer({
          code: "",
          name: "",
          description: "",
          address: "",
          phoneNumber: "",
          authorizationPerson: ""
        });
      } catch (error) {
        toast.error(`Hata: ${error.response?.data?.message || error.message}`);
      }
    };
  
    // Create new project
    const handleCreateProject = async () => {
      if (!selectedCustomer) return;
      try {
        await createProject(selectedCustomer.code, newProject);
        toast.success("Proje başarıyla oluşturuldu");
        await loadProjects(selectedCustomer);
        setNewProject({
          code: "",
          name: "",
          description: ""
        });
      } catch (error) {
        toast.error(`Hata: ${error.response?.data?.message || error.message}`);
      }
    };
  
    // Create new pano
    const handleCreatePano = async () => {
      if (!selectedCustomer || !selectedProject) return;
      try {
        await createPano(selectedCustomer.code, selectedProject.code, newPano);
        toast.success("Pano başarıyla oluşturuldu");
        await loadPanos(selectedProject);
        setNewPano({
          code: "",
          name: "",
          description: ""
        });
      } catch (error) {
        toast.error(`Hata: ${error.response?.data?.message || error.message}`);
      }
    };
  
    // Sayfa yüklendiğinde kural setlerini çek
    useEffect(() => {
      loadRuleSets();
    }, []);

    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-8">Etiket Yönetimi</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Müşteriler */}
          <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Müşteriler</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Yeni Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Kod</Label>
                    <Input 
                      value={newCustomer.code}
                      onChange={(e) => setNewCustomer({...newCustomer, code: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Ad</Label>
                    <Input 
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Açıklama</Label>
                    <Input 
                      value={newCustomer.description}
                      onChange={(e) => setNewCustomer({...newCustomer, description: e.target.value})}
                    />
                  </div>
                  {/* Add other fields as needed */}
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateCustomer}>Kaydet</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <button 
            onClick={loadCustomers}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            Müşterileri Yükle
          </button>
          <div className="space-y-2">
            {customers.map((customer) => (
              <div 
                key={customer.id}
                onClick={() => loadProjects(customer)}
                className={`p-3 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedCustomer?.id === customer.id ? 'bg-blue-100' : ''
                }`}
              >
                {customer.name} ({customer.code})
              </div>
            ))}
          </div>
        </div>

        {/* Projeler */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Projeler</h2>
            {selectedCustomer && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Yeni Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Proje Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Kod</Label>
                      <Input 
                        value={newProject.code}
                        onChange={(e) => setNewProject({...newProject, code: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Ad</Label>
                      <Input 
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Açıklama</Label>
                      <Input 
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateProject}>Kaydet</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {selectedCustomer && (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => loadPanos(project)}
                  className={`p-3 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedProject?.id === project.id ? 'bg-blue-100' : ''
                  }`}
                >
                  {project.name} ({project.code})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panolar */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Panolar</h2>
            {selectedProject && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Yeni Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Pano Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Kod</Label>
                      <Input 
                        value={newPano.code}
                        onChange={(e) => setNewPano({...newPano, code: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Ad</Label>
                      <Input 
                        value={newPano.name}
                        onChange={(e) => setNewPano({...newPano, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Açıklama</Label>
                      <Input 
                        value={newPano.description}
                        onChange={(e) => setNewPano({...newPano, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreatePano}>Kaydet</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {selectedProject && (
            <div className="space-y-2">
              {panos.map((pano) => (
                <div
                  key={pano.id}
                  onClick={() => loadLabels(pano)}
                  className={`p-3 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedPano?.id === pano.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <h3 className="font-medium">{pano.name} ({pano.code})</h3>
                  <p className="text-sm text-gray-600">{pano.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
  
          {/* Etiketler */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Etiketler</h2>
            {selectedPano && labels && (
              <div className="space-y-4">
                {/* Ader BMKs */}
                {labels.aderBMKs?.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded">
                    <h3 className="font-medium text-blue-600">Ader BMKs</h3>
                    <ul className="mt-2 space-y-3">
                      {labels.aderBMKs.map((group, i) => (
                        <li key={i} className="text-sm">
                          <div className="flex justify-between items-center">
                            <span>
                              {group.listName} ({group.listRowCount} kayıt)
                            </span>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    Etiket Çıkart
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Kural Seti Seçin</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Select onValueChange={(value) => setSelectedRuleSet(ruleSets.find(r => r.id === parseInt(value)))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Kural seti seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ruleSets
                                          .filter(r => r.labelType === "AderBMK")
                                          .map((ruleSet) => (
                                            <SelectItem key={ruleSet.id} value={ruleSet.id.toString()}>
                                              {ruleSet.name} ({ruleSet.ruleCount} kural)
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    <Button 
                                      onClick={() => handleApplyRule(group.listName, "AderBMK")}
                                      disabled={!selectedRuleSet || loading}
                                    >
                                      {loading ? "İşleniyor..." : "Uygula"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => handleListLabels(group.listName)}
                                  >
                                    Listele
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Manipüle Edilmiş Listeler</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {manipulatedLists.length > 0 ? (
                                      <>
                                        <ul className="space-y-2">
                                          {manipulatedLists.map((list, index) => (
                                            <li key={index} className="p-3 border rounded flex justify-between items-center">
                                              <div>
                                                <p className="font-medium">{list.applyedListName}</p>
                                                <p className="text-sm text-gray-600">
                                                  {list.labelType} - {list.listRowCount} kayıt
                                                </p>
                                              </div>
                                              <Button
                                                size="sm"
                                                onClick={() => handleExportLabels(
                                                  group.listName,
                                                  list.labelType,
                                                  list.applyedListName
                                                )}
                                              >
                                                Dosyayı Kaydet
                                              </Button>
                                            </li>
                                          ))}
                                        </ul>
                                      </>
                                    ) : (
                                      <p>Manipüle edilmiş liste bulunamadı</p>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
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
                        <li key={i} className="text-sm">
                          <div className="flex justify-between items-center">
                            <span>
                              {group.listName} ({group.listRowCount} kayıt)
                            </span>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    Etiket Çıkart
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Kural Seti Seçin</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Select onValueChange={(value) => setSelectedRuleSet(ruleSets.find(r => r.id === parseInt(value)))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Kural seti seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ruleSets
                                          .filter(r => r.labelType === "KlemensBMK")
                                          .map((ruleSet) => (
                                            <SelectItem key={ruleSet.id} value={ruleSet.id.toString()}>
                                              {ruleSet.name} ({ruleSet.ruleCount} kural)
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    <Button 
                                      onClick={() => handleApplyRule(group.listName, "KlemensBMK")}
                                      disabled={!selectedRuleSet || loading}
                                    >
                                      {loading ? "İşleniyor..." : "Uygula"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => handleListLabels(group.listName)}
                                  >
                                    Listele
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Manipüle Edilmiş Listeler</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {manipulatedLists.length > 0 ? (
                                      <>
                                        <ul className="space-y-2">
                                          {manipulatedLists.map((list, index) => (
                                            <li key={index} className="p-3 border rounded flex justify-between items-center">
                                              <div>
                                                <p className="font-medium">{list.applyedListName}</p>
                                                <p className="text-sm text-gray-600">
                                                  {list.labelType} - {list.listRowCount} kayıt
                                                </p>
                                              </div>
                                              <Button
                                                size="sm"
                                                onClick={() => handleExportLabels(
                                                  group.listName,
                                                  list.labelType,
                                                  list.applyedListName
                                                )}
                                              >
                                                Dosyayı Kaydet
                                              </Button>
                                            </li>
                                          ))}
                                        </ul>
                                      </>
                                    ) : (
                                      <p>Manipüle edilmiş liste bulunamadı</p>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
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
                        <li key={i} className="text-sm">
                          <div className="flex justify-between items-center">
                            <span>
                              {group.listName} ({group.listRowCount} kayıt)
                            </span>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    Etiket Çıkart
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Kural Seti Seçin</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Select onValueChange={(value) => setSelectedRuleSet(ruleSets.find(r => r.id === parseInt(value)))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Kural seti seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ruleSets
                                          .filter(r => r.labelType === "DeviceBMK")
                                          .map((ruleSet) => (
                                            <SelectItem key={ruleSet.id} value={ruleSet.id.toString()}>
                                              {ruleSet.name} ({ruleSet.ruleCount} kural)
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    <Button 
                                      onClick={() => handleApplyRule(group.listName, "DeviceBMK")}
                                      disabled={!selectedRuleSet || loading}
                                    >
                                      {loading ? "İşleniyor..." : "Uygula"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => handleListLabels(group.listName)}
                                  >
                                    Listele
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Manipüle Edilmiş Listeler</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {manipulatedLists.length > 0 ? (
                                      <>
                                        <ul className="space-y-2">
                                          {manipulatedLists.map((list, index) => (
                                            <li key={index} className="p-3 border rounded flex justify-between items-center">
                                              <div>
                                                <p className="font-medium">{list.applyedListName}</p>
                                                <p className="text-sm text-gray-600">
                                                  {list.labelType} - {list.listRowCount} kayıt
                                                </p>
                                              </div>
                                              <Button
                                                size="sm"
                                                onClick={() => handleExportLabels(
                                                  group.listName,
                                                  list.labelType,
                                                  list.applyedListName
                                                )}
                                              >
                                                Dosyayı Kaydet
                                              </Button>
                                            </li>
                                          ))}
                                        </ul>
                                      </>
                                    ) : (
                                      <p>Manipüle edilmiş liste bulunamadı</p>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
  
        {/* --- Excel Yükleme Formu --- */}
        {selectedPano && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Excelden Etiket Yükle</h2>
            <UploadForm
              customerCode={selectedCustomer.code}
              projectCode={selectedProject.code}
              panoName={selectedPano.name}
            />
          </div>
        )}
      </div>
    );
  }