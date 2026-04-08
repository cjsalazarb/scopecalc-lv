import { ProjectForm } from '../form'
import { createProject } from '../actions'

export default function NewProjectPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Nuevo proyecto</h2>
      <ProjectForm action={createProject} cancelHref="/projects" />
    </div>
  )
}
