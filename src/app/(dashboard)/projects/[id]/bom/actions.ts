'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRFQ(versionId: string, projectId: string, vendorName: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('rfq_packages') as any).insert({
    estimate_version_id: versionId,
    vendor_name: vendorName,
    status: 'draft',
  })
  revalidatePath(`/projects/${projectId}/bom`)
}

export async function saveQuoteLines(
  rfqId: string,
  projectId: string,
  lines: { catalog_item_id: string; unit_price: number; lead_time_days: number; notes: string }[]
) {
  const supabase = await createClient()

  // Eliminar líneas anteriores y reinsertar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('vendor_quote_lines') as any).delete().eq('rfq_package_id', rfqId)

  const toInsert = lines
    .filter((l) => l.unit_price > 0)
    .map((l) => ({ rfq_package_id: rfqId, ...l }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (toInsert.length > 0) await (supabase.from('vendor_quote_lines') as any).insert(toInsert)

  // Actualizar last_quote_price en catalog_items
  for (const l of toInsert) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('catalog_items') as any)
      .update({ last_quote_price: l.unit_price })
      .eq('id', l.catalog_item_id)
  }

  // Marcar RFQ como received
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('rfq_packages') as any).update({ status: 'received' }).eq('id', rfqId)

  revalidatePath(`/projects/${projectId}/bom`)
}

export async function applyQuoteToEstimate(rfqId: string, versionId: string, projectId: string) {
  const supabase = await createClient()

  // Obtener líneas de cotización
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: quoteLines } = await (supabase.from('vendor_quote_lines') as any)
    .select('catalog_item_id, unit_price')
    .eq('rfq_package_id', rfqId)

  if (!quoteLines || quoteLines.length === 0) return

  // Actualizar estimate_lines con precios nuevos
  for (const ql of quoteLines) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('estimate_lines') as any)
      .update({ unit_material_cost: ql.unit_price, source: 'actual' })
      .eq('estimate_version_id', versionId)
      .eq('catalog_item_id', ql.catalog_item_id)
  }

  revalidatePath(`/projects/${projectId}/bom`)
  revalidatePath(`/projects/${projectId}/estimate`)
}
