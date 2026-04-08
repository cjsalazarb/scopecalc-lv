import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const DISCIPLINES = [
  { value: '', label: 'Todas' },
  { value: 'cctv', label: 'CCTV' },
  { value: 'acs', label: 'ACS' },
  { value: 'intrusion', label: 'Intrusion' },
  { value: 'fire_alarm', label: 'Fire Alarm' },
  { value: 'general', label: 'General' },
]

interface AssemblyItem {
  quantity: number
  catalog_items: { ref_price: number | null; last_quote_price: number | null; labor_hours_per_unit: number } | null
}

interface Assembly {
  id: string
  name: string
  discipline: string | null
  description: string | null
  is_active: boolean
  assembly_items: AssemblyItem[]
}

export default async function AssembliesPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string }>
}) {
  const { discipline } = await searchParams
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('assemblies') as any)
    .select('*, assembly_items(quantity, catalog_items(ref_price, last_quote_price, labor_hours_per_unit))')
    .order('discipline')
    .order('name')

  if (discipline) query = query.eq('discipline', discipline)

  const { data: assemblies } = await query as { data: Assembly[] | null }

  function calcTotals(items: AssemblyItem[]) {
    let totalHours = 0
    let totalMaterial = 0
    for (const item of items) {
      const qty = item.quantity
      const ci = item.catalog_items
      if (!ci) continue
      totalHours += qty * (ci.labor_hours_per_unit ?? 0)
      const price = ci.last_quote_price ?? ci.ref_price ?? 0
      totalMaterial += qty * price
    }
    return { totalHours, totalMaterial }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Assemblies</h2>
        <Link href="/assemblies/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Nuevo assembly
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {DISCIPLINES.map((d) => (
          <Link
            key={d.value}
            href={d.value ? `/assemblies?discipline=${d.value}` : '/assemblies'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (discipline ?? '') === d.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {d.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {assemblies?.map((assembly) => {
          const { totalHours, totalMaterial } = calcTotals(assembly.assembly_items ?? [])
          return (
            <div key={assembly.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold">{assembly.name}</h3>
                  <span className="text-xs text-blue-400 uppercase">{assembly.discipline ?? 'general'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${assembly.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-500'}`}>
                  {assembly.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {assembly.description && <p className="text-gray-400 text-sm mb-3">{assembly.description}</p>}
              <div className="flex gap-4 text-sm border-t border-gray-800 pt-3 mt-3">
                <div>
                  <p className="text-gray-500 text-xs">Horas labor</p>
                  <p className="text-white font-medium">{totalHours.toFixed(2)}h</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Material est.</p>
                  <p className="text-white font-medium">${totalMaterial.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Ítems</p>
                  <p className="text-white font-medium">{assembly.assembly_items?.length ?? 0}</p>
                </div>
              </div>
              <Link href={`/assemblies/${assembly.id}/edit`} className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300 py-1.5 border border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
                Editar
              </Link>
            </div>
          )
        })}
        {(!assemblies || assemblies.length === 0) && (
          <p className="text-gray-500 col-span-3">No hay assemblies.</p>
        )}
      </div>
    </div>
  )
}
