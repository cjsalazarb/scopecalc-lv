'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface AssemblyItemInput {
  catalog_item_id: string
  quantity: number
  notes: string
}

function parseItems(formData: FormData): AssemblyItemInput[] {
  const items: AssemblyItemInput[] = []
  let i = 0
  while (formData.get(`items[${i}][catalog_item_id]`)) {
    const catalog_item_id = formData.get(`items[${i}][catalog_item_id]`) as string
    const quantity = Number(formData.get(`items[${i}][quantity]`) ?? 1)
    const notes = (formData.get(`items[${i}][notes]`) as string) || ''
    if (catalog_item_id) items.push({ catalog_item_id, quantity, notes })
    i++
  }
  return items
}

export async function createAssembly(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assembly, error } = await (supabase.from('assemblies') as any).insert({
    name: formData.get('name') as string,
    discipline: (formData.get('discipline') as string) || null,
    description: (formData.get('description') as string) || null,
    is_active: true,
  }).select().single()

  if (error || !assembly) redirect('/assemblies')

  const items = parseItems(formData).map((item) => ({ ...item, assembly_id: assembly.id }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (items.length > 0) await (supabase.from('assembly_items') as any).insert(items)

  redirect('/assemblies')
}

export async function updateAssembly(id: string, formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('assemblies') as any).update({
    name: formData.get('name') as string,
    discipline: (formData.get('discipline') as string) || null,
    description: (formData.get('description') as string) || null,
    is_active: formData.get('is_active') === 'true',
  }).eq('id', id)

  // Reemplazar ítems
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('assembly_items') as any).delete().eq('assembly_id', id)
  const items = parseItems(formData).map((item) => ({ ...item, assembly_id: id }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (items.length > 0) await (supabase.from('assembly_items') as any).insert(items)

  redirect('/assemblies')
}
