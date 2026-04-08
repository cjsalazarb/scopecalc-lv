import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SEED_ITEMS = [
  { category: 'cables', description: 'Cat6 UTP Cable', unit: 'ft', ref_price: 0.22, labor_hours_per_unit: 0 },
  { category: 'cables', description: '18/2 Shielded Cable', unit: 'ft', ref_price: 0.18, labor_hours_per_unit: 0 },
  { category: 'cables', description: 'FPLP Fire Alarm Cable 16/2', unit: 'ft', ref_price: 0.28, labor_hours_per_unit: 0 },
  { category: 'cameras', brand: 'Hikvision', model: 'DS-2CD2143G2-I', description: 'IP Camera Dome 4MP Indoor', unit: 'ea', ref_price: 89, labor_hours_per_unit: 2.5 },
  { category: 'cameras', brand: 'Hikvision', model: 'DS-2CD2143G2-IS', description: 'IP Camera Bullet 4MP Outdoor', unit: 'ea', ref_price: 110, labor_hours_per_unit: 3.5 },
  { category: 'switches', brand: 'UniFi', model: 'USW-Lite-8-PoE', description: 'PoE Switch 8-port', unit: 'ea', ref_price: 149, labor_hours_per_unit: 0.5 },
  { category: 'panels', brand: 'Hikvision', model: 'DS-7608NXI-I2', description: 'NVR 8ch PoE', unit: 'ea', ref_price: 280, labor_hours_per_unit: 1 },
  { category: 'accessories', brand: 'HID', model: 'R40', description: 'Access Control Reader', unit: 'ea', ref_price: 95, labor_hours_per_unit: 1 },
  { category: 'locks', brand: 'Securitron', model: 'M62', description: 'Magnetic Lock 600lb', unit: 'ea', ref_price: 120, labor_hours_per_unit: 0.5 },
  { category: 'sensors', brand: 'Bosch', model: 'DS150i', description: 'Door Contact', unit: 'ea', ref_price: 12, labor_hours_per_unit: 0.25 },
  { category: 'sensors', brand: 'DSC', model: 'LC-100-PI', description: 'PIR Motion Detector', unit: 'ea', ref_price: 18, labor_hours_per_unit: 0.5 },
  { category: 'detectors', brand: 'System Sensor', model: '2W-B', description: 'Addressable Smoke Detector', unit: 'ea', ref_price: 35, labor_hours_per_unit: 0.75 },
  { category: 'detectors', brand: 'System Sensor', model: 'SPSCW', description: 'Horn Strobe 24VDC', unit: 'ea', ref_price: 28, labor_hours_per_unit: 0.5 },
]

export async function POST() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('catalog_items') as any).insert(SEED_ITEMS)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, inserted: SEED_ITEMS.length })
}
