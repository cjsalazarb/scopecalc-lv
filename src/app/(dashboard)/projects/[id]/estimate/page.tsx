import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { EstimateClient } from './estimate-client'

export default async function EstimatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: project }, { data: catalogItems }, { data: assemblies }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('projects') as any).select('name, active_version_id, display_unit').eq('id', id).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('catalog_items') as any)
      .select('id, description, unit, ref_price, last_quote_price, labor_hours_per_unit, category')
      .eq('is_active', true).order('description'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('assemblies') as any)
      .select('id, name, discipline').eq('is_active', true).order('discipline').order('name'),
  ])

  if (!project) notFound()

  const versionId = project.active_version_id
  let lines = []
  if (versionId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('estimate_lines') as any)
      .select('*').eq('estimate_version_id', versionId).order('created_at')
    lines = data ?? []
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-800 px-8 py-4 bg-gray-950">
        <div className="flex items-center gap-2">
          <Link href={`/projects/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">← {project.name}</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-300 text-sm font-medium">Estimate</span>
        </div>
        {!versionId && (
          <p className="text-yellow-400 text-sm mt-2">Este proyecto no tiene versión activa. Crea el proyecto nuevamente.</p>
        )}
      </div>

      {versionId && (
        <EstimateClient
          projectId={id}
          versionId={versionId}
          lines={lines}
          catalogItems={catalogItems ?? []}
          assemblies={assemblies ?? []}
        />
      )}
    </div>
  )
}
