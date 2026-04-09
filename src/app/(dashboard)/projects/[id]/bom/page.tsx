import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BomClient } from './bom-client'
import { ExportButtons } from './export-buttons'

export default async function BomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase.from('projects') as any)
    .select('name, active_version_id').eq('id', id).single()

  if (!project) notFound()

  const versionId = project.active_version_id
  if (!versionId) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Sin versión activa.</p>
      </div>
    )
  }

  const [{ data: lines }, { data: rfqs }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('estimate_lines') as any)
      .select('*, catalog_items(id, description, category, unit, ref_price, last_quote_price)')
      .eq('estimate_version_id', versionId)
      .not('catalog_item_id', 'is', null)
      .order('created_at'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('rfq_packages') as any)
      .select('*, vendor_quote_lines(catalog_item_id, unit_price, lead_time_days, notes)')
      .eq('estimate_version_id', versionId)
      .order('created_at'),
  ])

  // Agrupar líneas por catalog_item_id para BOM consolidado
  const bomMap = new Map<string, {
    catalog_item_id: string; description: string; category: string
    unit: string; ref_price: number | null; last_quote_price: number | null
    qty: number; source: string
  }>()

  for (const line of lines ?? []) {
    const ci = line.catalog_items
    if (!ci) continue
    const existing = bomMap.get(ci.id)
    if (existing) {
      existing.qty += line.quantity
    } else {
      bomMap.set(ci.id, {
        catalog_item_id: ci.id,
        description: ci.description,
        category: ci.category,
        unit: ci.unit,
        ref_price: ci.ref_price,
        last_quote_price: ci.last_quote_price,
        qty: line.quantity,
        source: line.source,
      })
    }
  }

  const bom = Array.from(bomMap.values()).sort((a, b) => a.category.localeCompare(b.category))

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/projects/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">← {project.name}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-300 text-sm font-medium">BOM / RFQ</span>
      </div>
      <div className="mb-6">
        <ExportButtons projectId={id} />
      </div>
      <BomClient
        projectId={id}
        versionId={versionId}
        bom={bom}
        rfqs={rfqs ?? []}
      />
    </div>
  )
}
