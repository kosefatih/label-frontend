import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PanoForm({ newPano, setNewPano }) {
  return (
    <>
      <div>
        <Label>Kod</Label>
        <Input
          value={newPano.code}
          onChange={(e) => setNewPano({ ...newPano, code: e.target.value })}
        />
      </div>
      <div>
        <Label>Ad</Label>
        <Input
          value={newPano.name}
          onChange={(e) => setNewPano({ ...newPano, name: e.target.value })}
        />
      </div>
      <div>
        <Label>Açıklama</Label>
        <Input
          value={newPano.description}
          onChange={(e) => setNewPano({ ...newPano, description: e.target.value })}
        />
      </div>
    </>
  );
}