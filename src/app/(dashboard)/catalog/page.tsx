import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CatalogFilters } from './filters'

interface CatalogItem {
  id: string
  category: string
  brand: string | null
  model: string | null
  description: string
  unit: string
  ref_price: number | null
  last_quote_price: number | null
  labor_hours_per_unit: number
  is_active: boolean
  notes: string | null
}

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'cameras', label: 'Cámaras' },
  { value: 'cables', label: 'Cables' },
  { value: 'accessories', label: 'Accesorios' },
  { value: 'panels', label: 'Paneles' },
  { value: 'locks', label: 'Cerraduras' },
  { value: 'sensors', label: 'Sensores' },
  { value: 'detectors', label: 'Detectores' },
  { value: 'power_supplies', label: 'Fuentes' },
  { value: 'switches', label: 'Switches' },
  { value: 'software', label: 'Software' },
  { value: 'labor', label: 'Labor' },
  { value: 'other', label: 'Otro' },
]

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase.from('catalog_items') as any
  let query = client.select('*').order('category').order('description')
  if (category) query = query.eq('category', category)
  if (q) query = query.ilike('description', `%${q}%`)

  const { data: items } = await query as { data: CatalogItem[] | null }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Catálogo Maestro</h2>
        <Link
          href="/catalog/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo ítem
        </Link>
      </div>

      <CatalogFilters categories={CATEGORIES} currentCategory={category} currentQ={q} />

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
              <th className="text-left px-4 py-3">Descripción</th>
              <th className="text-left px-4 py-3">Categoría</th>
              <th className="text-left px-4 py-3">Marca / Modelo</th>
              <th className="text-left px-4 py-3">Unidad</th>
              <th className="text-right px-4 py-3">Precio Ref</th>
              <th className="text-right px-4 py-3">Última Cot</th>
              <th className="text-right px-4 py-3">Horas Labor</th>
              <th className="text-center px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{item.description as string}</td>
                <td className="px-4 py-3 text-gray-400">{item.category as string}</td>
                <td className="px-4 py-3 text-gray-400">
                  {[item.brand, item.model].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="px-4 py-3 text-gray-400">{item.unit as string}</td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {item.ref_price != null ? `$${Number(item.ref_price).toFixed(2)}` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {item.last_quote_price != null ? `$${Number(item.last_quote_price).toFixed(2)}` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">{Number(item.labor_hours_per_unit).toFixed(2)}h</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-500'}`}>
                    {item.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/catalog/${item.id}/edit`} className="text-blue-400 hover:text-blue-300 text-xs">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {(!items || items.length === 0) && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No hay ítems en el catálogo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
