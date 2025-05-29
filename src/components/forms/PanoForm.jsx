import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const PanoForm = memo(({ newPano, setNewPano }) => {
  return (
    <>
      <div>
        <Label>Kod</Label>
        <Input 
          value={newPano.code} 
          onChange={(e) => setNewPano(prev => ({ ...prev, code: e.target.value }))} 
        />
      </div>
      <div>
        <Label>Ad</Label>
        <Input 
          value={newPano.name} 
          onChange={(e) => setNewPano(prev => ({ ...prev, name: e.target.value }))} 
        />
      </div>
      <div>
        <Label>Açıklama</Label>
        <Input 
          value={newPano.description} 
          onChange={(e) => setNewPano(prev => ({ ...prev, description: e.target.value }))} 
        />
      </div>
    </>
  )
}) 