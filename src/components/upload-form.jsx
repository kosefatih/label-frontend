import React, { useState } from "react";
import { uploadExcel } from "../lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

const UploadForm = ({ customerCode, projectCode, panoName }) => {
  // Form state
  const [file, setFile] = useState(null);
  const [formValues, setFormValues] = useState({
    listName: "",
    sheetName: "",
    startRow: 2,
    type: 3,
    // AderBMK
    aderHasGroup: false,
    aderGroupCol: 0,
    aderLabelCols: "",
    // KlemensBMK
    klemensHasGroup: false,
    klemensGroupCol: 0,
    klemensLabelCols: "",
    klemensProductCode: 0,
    klemensWidth: 0,
    klemensFloor: 0,
    // DeviceBMK
    deviceEquals: 0,
    devicePlus: 0,
    deviceMinus: 0,
    deviceMerged: 0,
    deviceProduct: 0
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // Build the descModel object based on form values
  const buildDescModel = () => {
    const { 
      type, listName, sheetName, startRow,
      aderHasGroup, aderGroupCol, aderLabelCols,
      klemensHasGroup, klemensGroupCol, klemensLabelCols, 
      klemensProductCode, klemensWidth, klemensFloor,
      deviceEquals, devicePlus, deviceMinus, deviceMerged, deviceProduct
    } = formValues;

    return {
      ListName: listName,
      SheetName: sheetName,
      StartRowIndex: startRow,
      Type: type,
      AderBMKDetail: {
        IsAderBMK: type === 1,
        HasGroupLabel: type === 1 ? aderHasGroup : false,
        GroupLabelColumn: type === 1 ? aderGroupCol : 0,
        LabelColumns: type === 1 && aderLabelCols 
          ? aderLabelCols.split(",").map(Number).filter(n => !isNaN(n)) 
          : []
      },
      KlemensBMKDetail: {
        IsKlemensBMK: type === 2,
        HasGroupLabel: type === 2 ? klemensHasGroup : false,
        GroupLabelColumn: type === 2 ? klemensGroupCol : 0,
        LabelColumns: type === 2 && klemensLabelCols 
          ? klemensLabelCols.split(",").map(Number).filter(n => !isNaN(n)) 
          : [],
        ProductCode: type === 2 ? klemensProductCode : 0,
        Width: type === 2 ? klemensWidth : 0,
        Floor: type === 2 ? klemensFloor : 0
      },
      DeviceBMKDetail: {
        IsDeviceBMK: type === 3,
        EqualsStructureColumnNo: type === 3 ? deviceEquals : 0,
        PlusStructureColumnNo: type === 3 ? devicePlus : 0,
        MinusStructureColumnNo: type === 3 ? deviceMinus : 0,
        MergedColumnNo: type === 3 ? deviceMerged : 0,
        ProductCodeColumnNo: type === 3 ? deviceProduct : 0
      }
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!file) return toast.error("Lütfen bir dosya seçin");
    if (!formValues.listName) return toast.error("Liste adı boş olamaz");
    if (!formValues.sheetName) return toast.error("Sayfa adı boş olamaz");

    try {
      const descModel = buildDescModel();
      const person = localStorage.getItem('userId');
      
      await uploadExcel(
        person,
        customerCode,
        projectCode,
        panoName,
        file,
        descModel
      );
      
      toast.success("Dosya başarıyla yüklendi!");
    } catch (error) {
      handleError(error);
    }
  };

  // Error handling
  const handleError = (error) => {
    console.error("Yükleme hatası:", error);
    
    if (error.response?.data?.message?.includes("listAlreadyExistMsg")) {
      toast.error("Bu liste adı zaten mevcut!");
    } else if (error.response?.status === 413) {
      toast.error("Dosya boyutu çok büyük!");
    } else if (error.response?.status === 401) {
      toast.error("Yetkiniz yok, lütfen tekrar giriş yapın");
    } else {
      toast.error(`Yükleme başarısız: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Excel Dosyası Yükle</h1>
      
      {/* File Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Excel Dosyası</label>
        <Input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={(e) => setFile(e.target.files[0])} 
        />
      </div>

      {/* Basic Information */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Liste Adı*</label>
        <Input 
          name="listName"
          placeholder="Örnek: E511_DeviceBMKs" 
          value={formValues.listName}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Sayfa Adı*</label>
        <Input 
          name="sheetName"
          placeholder="Örnek: UVP_CE_Listesi" 
          value={formValues.sheetName}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Başlangıç Satırı</label>
        <Input
          name="startRow"
          type="number"
          min="1"
          value={formValues.startRow}
          onChange={handleChange}
        />
      </div>

      {/* Label Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Etiket Tipi*</label>
        <Select 
          value={formValues.type.toString()}
          onValueChange={(val) => setFormValues(prev => ({...prev, type: Number(val)}))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Etiket tipi seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">AderBMK</SelectItem>
            <SelectItem value="2">KlemensBMK</SelectItem>
            <SelectItem value="3">DeviceBMK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conditional Fields Based on Selected Type */}
      {formValues.type === 1 && (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
          <h2 className="font-semibold text-lg">AderBMK Ayarları</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Grup Etiketi Var Mı?</label>
            <Select 
              value={formValues.aderHasGroup.toString()}
              onValueChange={(val) => setFormValues(prev => ({...prev, aderHasGroup: val === "true"}))}
            > 
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Evet</SelectItem>
                <SelectItem value="false">Hayır</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Grup Etiket Sütunu</label>
            <Input 
              name="aderGroupCol"
              type="number"
              min="0"
              value={formValues.aderGroupCol}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Etiket Sütunları (virgülle ayırın)</label>
            <Input 
              name="aderLabelCols"
              placeholder="Örnek: 0,2" 
              value={formValues.aderLabelCols}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      {formValues.type === 2 && (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
          <h2 className="font-semibold text-lg">KlemensBMK Ayarları</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Grup Etiketi Var Mı?</label>
            <Select 
              value={formValues.klemensHasGroup.toString()}
              onValueChange={(val) => setFormValues(prev => ({...prev, klemensHasGroup: val === "true"}))}
            > 
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Evet</SelectItem>
                <SelectItem value="false">Hayır</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Grup Etiket Sütunu</label>
            <Input 
              name="klemensGroupCol"
              type="number"
              min="0"
              value={formValues.klemensGroupCol}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Etiket Sütunları (virgülle ayırın)</label>
            <Input 
              name="klemensLabelCols"
              placeholder="Örnek: 1,3" 
              value={formValues.klemensLabelCols}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Ürün Kodu Sütunu</label>
            <Input 
              name="klemensProductCode"
              type="number"
              min="0"
              value={formValues.klemensProductCode}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Genişlik Sütunu</label>
            <Input 
              name="klemensWidth"
              type="number"
              min="0"
              value={formValues.klemensWidth}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Kat Sütunu</label>
            <Input 
              name="klemensFloor"
              type="number"
              min="0"
              value={formValues.klemensFloor}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      {formValues.type === 3 && (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
          <h2 className="font-semibold text-lg">DeviceBMK Ayarları</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Equals Structure Sütunu</label>
            <Input 
              name="deviceEquals"
              type="number"
              min="0"
              value={formValues.deviceEquals}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Plus Structure Sütunu</label>
            <Input 
              name="devicePlus"
              type="number"
              min="0"
              value={formValues.devicePlus}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Minus Structure Sütunu</label>
            <Input 
              name="deviceMinus"
              type="number"
              min="0"
              value={formValues.deviceMinus}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Merged Sütunu</label>
            <Input 
              name="deviceMerged"
              type="number"
              min="0"
              value={formValues.deviceMerged}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Ürün Kodu Sütunu</label>
            <Input 
              name="deviceProduct"
              type="number"
              min="0"
              value={formValues.deviceProduct}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      <Button 
        className="w-full py-2"
        onClick={handleSubmit}
      >
        Yükle
      </Button>
    </div>
  );
};

export default UploadForm;