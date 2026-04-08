'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function parseItem(formData: FormData) {
  return {
    category: formData.get('category') as string,
    brand: (formData.get('brand') as string) || null,
    model: (formData.get('model') as string) || null,
    description: formData.get('description') as string,
    unit: formData.get('unit') as string,
    ref_price: formData.get('ref_price') ? Number(formData.get('ref_price')) : null,
    last_quote_price: formData.get('last_quote_price') ? Number(formData.get('last_quote_price')) : null,
    labor_hours_per_unit: Number(formData.get('labor_hours_per_unit') ?? 0),
    notes: (formData.get('notes') as string) || null,
  }
}

export async function createCatalogItem(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('catalog_items') as any).insert({ ...parseItem(formData), is_active: true })
  redirect('/catalog')
}

export async function updateCatalogItem(id: string, formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('catalog_items') as any).update({
    ...parseItem(formData),
    is_active: formData.get('is_active') === 'true',
  }).eq('id', id)
  redirect('/catalog')
}
