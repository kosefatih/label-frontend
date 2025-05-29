import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const ProjectForm = memo(({ newProject, setNewProject }) => {
  return (
    <>
      <div>
        <Label>Kod</Label>
        <Input 
          value={newProject.code} 
          onChange={(e) => setNewProject(prev => ({ ...prev, code: e.target.value }))} 
        />
      </div>
      <div>
        <Label>Ad</Label>
        <Input 
          value={newProject.name} 
          onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))} 
        />
      </div>
      <div>
        <Label>Açıklama</Label>
        <Input
          value={newProject.description}
          onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
    </>
  )
}) 