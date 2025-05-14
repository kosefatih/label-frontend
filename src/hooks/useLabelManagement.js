import { useState, useEffect } from "react";
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
} from "../lib/api";
import { showFeedback } from "../lib/feedback";

export function useLabelManagement() {
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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [currentExportItem, setCurrentExportItem] = useState(null);
  const [errors, setErrors] = useState({});
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
    deviceBMKExportSettings: { fileName: "", repeatCount: 0 },
  });
  const [newCustomer, setNewCustomer] = useState({
    code: "",
    name: "",
    description: "",
    address: "",
    phoneNumber: "",
    authorizationPerson: "",
  });
  const [newProject, setNewProject] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [newPano, setNewPano] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [deviceDefines, setDeviceDefines] = useState([
    {
      eplanId: "",
      category: "",
      productNumber: "",
      orderNumber: "",
      producerName: "",
      producerCode: "",
    },
  ]);
  const [showDeviceDefineDialog, setShowDeviceDefineDialog] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
      showFeedback("success", "Müşteriler başarıyla yüklendi", { operation: "Veri yükleme" });
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Veri yükleme" });
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (customer) => {
    try {
      setLoading(true);
      setSelectedCustomer(customer);
      setSelectedProject(null);
      setPanos([]);
      setLabels(null);
      const data = await getProjects(customer.code);
      setProjects(data);
      showFeedback("success", `${customer.name} müşterisinin projeleri yüklendi`, { operation: "Veri yükleme" });
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Veri yükleme" });
    } finally {
      setLoading(false);
    }
  };

  const loadPanos = async (project) => {
    try {
      setLoading(true);
      setSelectedProject(project);
      setSelectedPano(null);
      setLabels(null);
      if (!selectedCustomer) return;
      const data = await getPanos(selectedCustomer.code, project.code);
      setPanos(data);
      showFeedback("success", `${project.name} projesinin panoları yüklendi`, { operation: "Veri yükleme" });
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Veri yükleme" });
    } finally {
      setLoading(false);
    }
  };

  const loadLabels = async (pano) => {
    try {
      setLoading(true);
      setSelectedPano(pano);
      if (!selectedCustomer || !selectedProject) return;
      const data = await getLabels(selectedCustomer.code, selectedProject.code, pano.code);
      setLabels(data);
      showFeedback("success", `${pano.code} panosunun etiketleri yüklendi`, { operation: "Veri yükleme" });
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Veri yükleme" });
    } finally {
      setLoading(false);
    }
  };

  const loadRuleSets = async () => {
    try {
      const data = await getRuleSets();
      setRuleSets(data);
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Kural setleri yükleme" });
    }
  };

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
        false
      );
      showFeedback("success", result, { operation: "Kural uygulama" });
    } catch (error) {
      let errorMessage = error.message;
      let errorDetails = null;
      let productList = null;
      if (error.response?.data) {
        try {
          const errorData =
            typeof error.response.data === "string" ? JSON.parse(error.response.data) : error.response.data;
          const messageParts = errorData.Message?.split("&-&") || [];
          errorDetails = {
            status: errorData.Status || error.response.status,
            mainMessage: messageParts[0]?.trim() || errorData.Message,
            module: messageParts[1]?.replace("Hatanın oluştuğu modül:", "").trim(),
            repository: messageParts[2]?.replace("İstek gönderilen repository:", "").trim(),
            exceptionType: errorData.Data,
          };
          if (messageParts[3]) {
            productList = messageParts[3]
              .replace("Kategorisi(leri) tanımlı olmayan cihaz listesi:-ProductCodes:-", "")
              .split("\n")
              .filter((p) => p.trim());
          }
          errorMessage = errorDetails.mainMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
      }
      showFeedback("error", errorMessage, {
        operation: "Kural uygulama",
        products: productList,
        errorDetails: {
          ...errorDetails,
          technicalMessage: `Modül: ${errorDetails?.module || "Bilinmiyor"}\nRepository: ${errorDetails?.repository || "Bilinmiyor"}`,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetManipulatedLabels = async (listName) => {
    try {
      setLoading(true);
      const data = await getManipulatedLabels(selectedCustomer.code, selectedProject.code, selectedPano.code, listName);
      setManipulatedLists(data.applyedLists);
    } catch (error) {
      let errorMessage = error.message;
      let errorDetails = null;
      if (error.response?.data) {
        try {
          const errorData =
            typeof error.response.data === "string" ? JSON.parse(error.response.data) : error.response.data;
          const messageParts = errorData.Message?.split("&-&") || [];
          errorDetails = {
            status: errorData.Status || error.response.status,
            mainMessage: messageParts[0]?.trim() || errorData.Message,
            module: messageParts[1]?.replace("Hatanın oluştuğu modül:", "").trim(),
            repository: messageParts[2]?.replace("İstek gönderilen repository:", "").trim(),
            exceptionType: errorData.Data,
          };
          errorMessage = errorDetails.mainMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
      }
      console.groupCollapsed("%cAPI Error Details", "color: red; font-weight: bold;");
      console.error("Endpoint:", `${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error("Status:", error.response?.status || "No response");
      console.error("Message:", errorMessage);
      if (errorDetails) {
        console.group("Error Details");
        console.log("Module:", errorDetails.module);
        console.log("Repository:", errorDetails.repository);
        console.log("Exception:", errorDetails.exceptionType);
        console.groupEnd();
      }
      console.log("Full error object:", error);
      console.groupEnd();
      showFeedback("error", errorMessage, {
        operation: "Liste yükleme",
        errorDetails: {
          ...errorDetails,
          technicalMessage: `Modül: ${errorDetails?.module || "Bilinmiyor"}\nRepository: ${errorDetails?.repository || "Bilinmiyor"}`,
        },
        showDetailsButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportLabels = async (listName, labelType, applyedListName, customSettings = null) => {
    try {
      setLoading(true);
      const settings = customSettings || {
        ...exportSettings,
        [`${labelType}ExportSettings`]: {
          ...exportSettings[`${labelType}ExportSettings`],
          fileName: applyedListName,
        },
      };
      const response = await exportLabelList(
        selectedCustomer.code,
        selectedProject.code,
        selectedPano.code,
        listName,
        labelType,
        applyedListName,
        settings
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${applyedListName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showFeedback("success", "Excel dosyası indirildi", { operation: "Dosya indirme" });
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Dosya indirme" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabel = async (listName) => {
    try {
      setLoading(true);
      await deleteLabelList(selectedCustomer.code, selectedProject.code, selectedPano.code, listName);
      showFeedback("success", `${listName} listesi başarıyla silindi`, { operation: "Liste silme" });
      const updatedLabels = await getLabels(
        selectedCustomer.code,
        selectedProject.code,
        selectedPano.code
      );
      setLabels(updatedLabels);
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Liste silme" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      setLoading(true);
      await createCustomer(newCustomer);
      showFeedback("success", `${newCustomer.name} müşterisi oluşturuldu`, { operation: "Müşteri oluşturma" });
      await loadCustomers();
      setNewCustomer({
        code: "",
        name: "",
        description: "",
        address: "",
        phoneNumber: "",
        authorizationPerson: "",
      });
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Müşteri oluşturma" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!selectedCustomer) return;
    try {
      setLoading(true);
      await createProject(selectedCustomer.code, newProject);
      showFeedback("success", `${newProject.name} projesi oluşturuldu`, { operation: "Proje oluşturma" });
      await loadProjects(selectedCustomer);
      setNewProject({ code: "", name: "", description: "" });
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Proje oluşturma" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePano = async () => {
    if (!selectedCustomer || !selectedProject) return;
    try {
      setLoading(true);
      await createPano(selectedCustomer.code, selectedProject.code, newPano);
      showFeedback("success", `${newPano.code} panosu oluşturuldu`, { operation: "Pano oluşturma" });
      await loadPanos(selectedProject);
      setNewPano({ code: "", name: "", description: "" });
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { operation: "Pano oluşturma" });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewLabels = async (listName, labelType, applyedListName) => {
    try {
      if (labelType !== "AderBMK") {
        showFeedback("warning", "Önizleme sadece AderBMK etiketleri için kullanılabilir", {
          operation: "Önizleme",
        });
        return;
      }
      setLoading(true);
      const [originalData, manipulatedData] = await Promise.all([
        getLabelList(selectedCustomer.code, selectedProject.code, selectedPano.code, listName),
        getManipulatedLabelsbyId(
          selectedCustomer.code,
          selectedProject.code,
          selectedPano.code,
          listName,
          applyedListName
        ),
      ]);
      setPreviewData({
        customerName: selectedCustomer.name,
        projectName: selectedProject.name,
        panoName: selectedPano.name,
        listName,
        applyListName: applyedListName,
        labelType,
        labels: manipulatedData.labels,
        originalLabels: originalData.labels,
      });
      setPreviewDialogOpen(true);
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, {
        operation: "Önizleme yükleme",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceDefineChange = (index, field, value) => {
    if (field === "eplanId" && value.includes("/")) {
      setErrors((prev) => ({
        ...prev,
        [index]: "Eplan ID'de '/' karakteri kullanılamaz",
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
    const updatedDefines = [...deviceDefines];
    updatedDefines[index][field] = value;
    setDeviceDefines(updatedDefines);
  };

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
    ]);
  };

  const removeDeviceDefineRow = (index) => {
    if (deviceDefines.length <= 1) return;
    const newDefines = [...deviceDefines];
    newDefines.splice(index, 1);
    setDeviceDefines(newDefines);
  };

  const handleSubmitDeviceDefines = async () => {
    const validationErrors = {};
    let hasError = false;
    deviceDefines.forEach((define, index) => {
      if (define.eplanId.includes("/")) {
        validationErrors[index] = "Eplan ID'de '/' karakteri kullanılamaz";
        hasError = true;
      }
      if (!define.eplanId.trim()) {
        validationErrors[index] = validationErrors[index] || "Eplan ID zorunludur";
        hasError = true;
      }
    });
    if (hasError) {
      setErrors(validationErrors);
      const firstErrorIndex = Object.keys(validationErrors)[0];
      if (firstErrorIndex) {
        const element = document.getElementById(`eplanId-${firstErrorIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }
      showFeedback("error", "Lütfen formdaki hataları düzeltin", { operation: "Cihaz tanımları ekleme" });
      return;
    }
    try {
      setLoading(true);
      await createMultipleDeviceDefines(deviceDefines);
      showFeedback("success", "Cihaz tanımları başarıyla eklendi", {
        operation: "Cihaz tanımları ekleme",
      });
      setShowDeviceDefineDialog(false);
      setDeviceDefines([
        {
          eplanId: "",
          category: "",
          productNumber: "",
          orderNumber: "",
          producerName: "",
          producerCode: "",
        },
      ]);
      setErrors({});
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, {
        operation: "Cihaz tanımları ekleme",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuleSets();
  }, []);

  return {
    customers,
    selectedCustomer,
    projects,
    selectedProject,
    panos,
    selectedPano,
    labels,
    ruleSets,
    selectedRuleSet,
    loading,
    manipulatedLists,
    exportDialogOpen,
    currentExportItem,
    errors,
    exportSettings,
    newCustomer,
    newProject,
    newPano,
    deviceDefines,
    showDeviceDefineDialog,
    repeatCount,
    previewDialogOpen,
    previewData,
    setCustomers,
    setSelectedCustomer,
    setProjects,
    setSelectedProject,
    setPanos,
    setSelectedPano,
    setLabels,
    setRuleSets,
    setSelectedRuleSet,
    setLoading,
    setManipulatedLists,
    setExportDialogOpen,
    setCurrentExportItem,
    setErrors,
    setExportSettings,
    setNewCustomer,
    setNewProject,
    setNewPano,
    setDeviceDefines,
    setShowDeviceDefineDialog,
    setRepeatCount,
    setPreviewDialogOpen,
    setPreviewData,
    loadCustomers,
    loadProjects,
    loadPanos,
    loadLabels,
    handleApplyRule,
    handleGetManipulatedLabels,
    handleExportLabels,
    handleDeleteLabel,
    handleCreateCustomer,
    handleCreateProject,
    handleCreatePano,
    handlePreviewLabels,
    handleDeviceDefineChange,
    addNewDeviceDefineRow,
    removeDeviceDefineRow,
    handleSubmitDeviceDefines,
  };
}