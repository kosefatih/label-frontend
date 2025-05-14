import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerForm({ newCustomer, setNewCustomer }) {
  return (
    <>
      <div>
        <Label>Kod</Label>
        <Input
          value={newCustomer.code}
          onChange={(e) => setNewCustomer({ ...newCustomer, code: e.target.value })}
        />
      </div>
      <div>
        <Label>Ad</Label>
        <Input
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
        />
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
  );
}