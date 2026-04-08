import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectForm } from '../../form'
import { updateProject } from '../../actions'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase.from('projects') as any).select('*').eq('id', id).single()
  if (!project) notFound()

  const action = updateProject.bind(null, id)

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Editar proyecto</h2>
      <ProjectForm action={action} project={project} cancelHref={`/projects/${id}`} />
    </div>
  )
}
