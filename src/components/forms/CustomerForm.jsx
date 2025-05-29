import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const CustomerForm = memo(({ newCustomer, setNewCustomer }) => {
  return (
    <>
      <div>
        <Label>Kod</Label>
        <Input 
          value={newCustomer.code} 
          onChange={(e) => setNewCustomer(prev => ({ ...prev, code: e.target.value }))} 
        />
      </div>
      <div>
        <Label>Ad</Label>
        <Input 
          value={newCustomer.name} 
          onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))} 
        />
      </div>
      <div>
        <Label>Açıklama</Label>
        <Input
          value={newCustomer.description}
          onChange={(e) => setNewCustomer(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      <div>
        <Label>Adres</Label>
        <Input
          value={newCustomer.address}
          onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>
    </>
  )
}) 