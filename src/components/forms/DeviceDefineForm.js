import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CATEGORY_OPTIONS = [
  { value: "Pano", label: "Pano Etiketi" },
  { value: "Device", label: "Cihaz Etiketi" }
];

export default function DeviceDefineForm({
  deviceDefines,
  errors,
  handleDeviceDefineChange,
  addNewDeviceDefineRow,
  removeDeviceDefineRow,
}) {
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
      {deviceDefines.map((define, index) => (
        <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label>Eplan ID</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>"/" karakteri otomatik olarak "_" karakterine dönüştürülür</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
              <Select
                value={define.category}
                onValueChange={(value) => handleDeviceDefineChange(index, "category", value)}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
  );
}