import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProjectForm({ newProject, setNewProject }) {
  return (
    <>
      <div>
        <Label>Kod</Label>
        <Input
          value={newProject.code}
          onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
        />
      </div>
      <div>
        <Label>Ad</Label>
        <Input
          value={newProject.name}
          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
        />
      </div>
      <div>
        <Label>Açıklama</Label>
        <Input
          value={newProject.description}
          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
        />
      </div>
    </>
  );
}