'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCatalogItem(versionId: string, projectId: string, catalogItemId: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ci } = await (supabase.from('catalog_items') as any)
    .select('description, ref_price, last_quote_price, labor_hours_per_unit, unit')
    .eq('id', catalogItemId).single()

  if (!ci) return

  const price = ci.last_quote_price ?? ci.ref_price ?? 0
  const source = ci.last_quote_price ? 'last_quote' : ci.ref_price ? 'ref' : 'manual'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('estimate_lines') as any).insert({
    estimate_version_id: versionId,
    catalog_item_id: catalogItemId,
    description: ci.description,
    quantity: 1,
    unit_material_cost: price,
    unit_labor_hours: ci.labor_hours_per_unit ?? 0,
    source,
    snapshot_data: { unit: ci.unit },
  })
  revalidatePath(`/projects/${projectId}/estimate`)
}

export async function addAssembly(versionId: string, projectId: string, assemblyId: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assembly } = await (supabase.from('assemblies') as any)
    .select('*, assembly_items(quantity, notes, catalog_items(id, description, ref_price, last_quote_price, labor_hours_per_unit, unit))')
    .eq('id', assemblyId).single()

  if (!assembly) return

  const lines = (assembly.assembly_items ?? []).map((item: {
    quantity: number
    notes: string | null
    catalog_items: { id: string; description: string; ref_price: number | null; last_quote_price: number | null; labor_hours_per_unit: number; unit: string } | null
  }) => {
    const ci = item.catalog_items
    if (!ci) return null
    const price = ci.last_quote_price ?? ci.ref_price ?? 0
    const source = ci.last_quote_price ? 'last_quote' : ci.ref_price ? 'ref' : 'manual'
    return {
      estimate_version_id: versionId,
      catalog_item_id: ci.id,
      assembly_id: assemblyId,
      description: ci.description,
      quantity: item.quantity,
      unit_material_cost: price,
      unit_labor_hours: ci.labor_hours_per_unit ?? 0,
      source,
      snapshot_data: {
        assembly_name: assembly.name,
        assembly_discipline: assembly.discipline,
        unit: ci.unit,
        notes: item.notes,
        snapshot_at: new Date().toISOString(),
      },
    }
  }).filter(Boolean)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (lines.length > 0) await (supabase.from('estimate_lines') as any).insert(lines)
  revalidatePath(`/projects/${projectId}/estimate`)
}

export async function updateLine(
  lineId: string,
  projectId: string,
  fields: { quantity?: number; unit_material_cost?: number; unit_labor_hours?: number; override_note?: string }
) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('estimate_lines') as any).update(fields).eq('id', lineId)
  revalidatePath(`/projects/${projectId}/estimate`)
}

export async function deleteLine(lineId: string, projectId: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('estimate_lines') as any).delete().eq('id', lineId)
  revalidatePath(`/projects/${projectId}/estimate`)
}

export async function addManualLine(versionId: string, projectId: string, description: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('estimate_lines') as any).insert({
    estimate_version_id: versionId,
    description,
    quantity: 1,
    unit_material_cost: 0,
    unit_labor_hours: 0,
    source: 'manual',
  })
  revalidatePath(`/projects/${projectId}/estimate`)
}
