'use client'

import Link from 'next/link'

const CATEGORIES = [
  'cameras', 'cables', 'accessories', 'panels', 'locks',
  'sensors', 'detectors', 'power_supplies', 'switches', 'software', 'labor', 'other',
]
const UNITS = ['ea', 'ft', 'roll', 'lot', 'hr', 'set']

interface CatalogItem {
  category: unknown
  brand: unknown
  model: unknown
  description: unknown
  unit: unknown
  ref_price: unknown
  last_quote_price: unknown
  labor_hours_per_unit: unknown
  notes: unknown
  is_active: unknown
}

export function CatalogForm({ action, item }: { action: (f: FormData) => Promise<void>; item?: CatalogItem }) {
  return (
    <form action={action} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Descripción *</label>
          <input name="description" required defaultValue={item?.description as string}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Categoría *</label>
          <select name="category" required defaultValue={item?.category as string ?? 'other'}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Unidad</label>
          <select name="unit" defaultValue={item?.unit as string ?? 'ea'}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Marca</label>
          <input name="brand" defaultValue={item?.brand as string}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Modelo</label>
          <input name="model" defaultValue={item?.model as string}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Precio referencial ($)</label>
          <input name="ref_price" type="number" step="0.01" min="0" defaultValue={item?.ref_price as number}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Última cotización ($)</label>
          <input name="last_quote_price" type="number" step="0.01" min="0" defaultValue={item?.last_quote_price as number}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Horas labor por unidad</label>
          <input name="labor_hours_per_unit" type="number" step="0.25" min="0" defaultValue={item?.labor_hours_per_unit as number ?? 0}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        {item && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Estado</label>
            <select name="is_active" defaultValue={String(item.is_active)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        )}

        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Notas</label>
          <textarea name="notes" rows={2} defaultValue={item?.notes as string}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          Guardar
        </button>
        <Link href="/catalog"
          className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
