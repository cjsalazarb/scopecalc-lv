import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  // Obtener IDs de catalog_items por descripción
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase.from('catalog_items') as any)
    .select('id, description')

  const byDesc = Object.fromEntries((items ?? []).map((i: { id: string; description: string }) => [i.description, i.id]))

  const ASSEMBLIES = [
    {
      assembly: { name: 'Cámara IP Interior Estándar', discipline: 'cctv', is_active: true },
      items: [
        { description: 'IP Camera Dome 4MP Indoor', quantity: 1 },
        { description: 'Cat6 UTP Cable', quantity: 100 },
      ],
    },
    {
      assembly: { name: 'Cámara IP Exterior Estándar', discipline: 'cctv', is_active: true },
      items: [
        { description: 'IP Camera Bullet 4MP Outdoor', quantity: 1 },
        { description: 'Cat6 UTP Cable', quantity: 100 },
      ],
    },
    {
      assembly: { name: 'Puerta ACS Single Reader', discipline: 'acs', is_active: true },
      items: [
        { description: 'Access Control Reader', quantity: 1 },
        { description: 'Magnetic Lock 600lb', quantity: 1 },
        { description: 'Door Contact', quantity: 1 },
        { description: '18/2 Shielded Cable', quantity: 150 },
      ],
    },
    {
      assembly: { name: 'Detector Addressable', discipline: 'fire_alarm', is_active: true },
      items: [
        { description: 'Addressable Smoke Detector', quantity: 1 },
        { description: 'FPLP Fire Alarm Cable 16/2', quantity: 50 },
      ],
    },
    {
      assembly: { name: 'Horn Strobe NAC', discipline: 'fire_alarm', is_active: true },
      items: [
        { description: 'Horn Strobe 24VDC', quantity: 1 },
        { description: 'FPLP Fire Alarm Cable 16/2', quantity: 50 },
      ],
    },
  ]

  const results = []

  for (const { assembly, items } of ASSEMBLIES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created } = await (supabase.from('assemblies') as any)
      .insert(assembly).select().single()

    if (!created) continue

    const assemblyItems = items
      .map((i) => ({ assembly_id: created.id, catalog_item_id: byDesc[i.description], quantity: i.quantity }))
      .filter((i) => i.catalog_item_id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (assemblyItems.length > 0) await (supabase.from('assembly_items') as any).insert(assemblyItems)
    results.push(created.name)
  }

  return NextResponse.json({ ok: true, created: results })
}
