'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function parseProject(formData: FormData) {
  const disciplines = formData.getAll('disciplines') as string[]
  return {
    name: formData.get('name') as string,
    client: (formData.get('client') as string) || null,
    location: (formData.get('location') as string) || null,
    disciplines,
    floors: Number(formData.get('floors') ?? 1),
    display_unit: (formData.get('display_unit') as 'ft' | 'm') ?? 'ft',
    notes: (formData.get('notes') as string) || null,
  }
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase.from('projects') as any)
    .insert({ ...parseProject(formData), status: 'active' })
    .select()
    .single()

  if (!project) redirect('/projects')

  // Auto-generar V1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: version } = await (supabase.from('estimate_versions') as any)
    .insert({ project_id: project.id, version_label: 'V1', status: 'draft' })
    .select()
    .single()

  // Pricing rules con defaults
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('pricing_rules') as any).insert({
    project_id: project.id,
    overhead_pct: 10,
    contingency_pct: 5,
    markup_pct: 20,
    tax_pct: 0,
    labor_rate_per_hr: 65,
  })

  // Activar V1
  if (version) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('projects') as any)
      .update({ active_version_id: version.id })
      .eq('id', project.id)
  }

  redirect(`/projects/${project.id}`)
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('projects') as any)
    .update({ ...parseProject(formData) })
    .eq('id', id)
  redirect(`/projects/${id}`)
}

export async function createNewVersion(projectId: string, activeVersionId: string) {
  const supabase = await createClient()

  // Obtener label de la última versión
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: versions } = await (supabase.from('estimate_versions') as any)
    .select('version_label')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)

  const lastLabel = versions?.[0]?.version_label ?? 'V1'
  const nextNum = parseInt(lastLabel.replace('V', '')) + 1
  const newLabel = `V${nextNum}`

  // Crear nueva versión
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newVersion } = await (supabase.from('estimate_versions') as any)
    .insert({ project_id: projectId, version_label: newLabel, status: 'draft' })
    .select()
    .single()

  if (!newVersion) return

  // Duplicar líneas de la versión activa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lines } = await (supabase.from('estimate_lines') as any)
    .select('*')
    .eq('estimate_version_id', activeVersionId)

  if (lines && lines.length > 0) {
    const newLines = lines.map(({ id: _id, created_at: _ca, estimate_version_id: _evi, ...rest }: Record<string, unknown>) => ({
      ...rest,
      estimate_version_id: newVersion.id,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('estimate_lines') as any).insert(newLines)
  }

  // Activar nueva versión
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('projects') as any)
    .update({ active_version_id: newVersion.id })
    .eq('id', projectId)

  redirect(`/projects/${projectId}`)
}
