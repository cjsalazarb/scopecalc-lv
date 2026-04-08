'use client'

import { useState } from 'react'
import Link from 'next/link'

const DISCIPLINES = ['cctv', 'acs', 'intrusion', 'fire_alarm', 'general']

interface CatalogItem {
  id: string
  description: string
  unit: string
  labor_hours_per_unit: number
  ref_price: number | null
  last_quote_price: number | null
}

interface ItemRow {
  catalog_item_id: string
  quantity: number
  notes: string
}

interface AssemblyData {
  name: string
  discipline: string | null
  description: string | null
  is_active: boolean
  assembly_items?: { catalog_item_id: string; quantity: number; notes: string | null }[]
}

export function AssemblyForm({
  action,
  assembly,
  catalogItems,
}: {
  action: (f: FormData) => Promise<void>
  assembly?: AssemblyData
  catalogItems: CatalogItem[]
}) {
  const [rows, setRows] = useState<ItemRow[]>(
    assembly?.assembly_items?.map((i) => ({
      catalog_item_id: i.catalog_item_id,
      quantity: i.quantity,
      notes: i.notes ?? '',
    })) ?? []
  )

  function addRow() {
    setRows((r) => [...r, { catalog_item_id: '', quantity: 1, notes: '' }])
  }

  function removeRow(idx: number) {
    setRows((r) => r.filter((_, i) => i !== idx))
  }

  function updateRow(idx: number, field: keyof ItemRow, value: string | number) {
    setRows((r) => r.map((row, i) => i === idx ? { ...row, [field]: value } : row))
  }

  const totalHours = rows.reduce((acc, row) => {
    const ci = catalogItems.find((c) => c.id === row.catalog_item_id)
    return acc + (ci ? row.quantity * ci.labor_hours_per_unit : 0)
  }, 0)

  const totalMaterial = rows.reduce((acc, row) => {
    const ci = catalogItems.find((c) => c.id === row.catalog_item_id)
    const price = ci ? (ci.last_quote_price ?? ci.ref_price ?? 0) : 0
    return acc + row.quantity * price
  }, 0)

  return (
    <form action={action} className="space-y-5 bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Nombre *</label>
          <input name="name" required defaultValue={assembly?.name}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Disciplina</label>
          <select name="discipline" defaultValue={assembly?.discipline ?? ''}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
            <option value="">general</option>
            {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {assembly && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Estado</label>
            <select name="is_active" defaultValue={String(assembly.is_active)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        )}
        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Descripción</label>
          <textarea name="description" rows={2} defaultValue={assembly?.description ?? ''}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-300 font-medium">Ítems del assembly</label>
          <button type="button" onClick={addRow}
            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
            + Agregar ítem
          </button>
        </div>

        {rows.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-4 border border-dashed border-gray-700 rounded-lg">
            Sin ítems. Haz click en &quot;+ Agregar ítem&quot;.
          </p>
        )}

        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">
                <select
                  name={`items[${idx}][catalog_item_id]`}
                  value={row.catalog_item_id}
                  onChange={(e) => updateRow(idx, 'catalog_item_id', e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar ítem...</option>
                  {catalogItems.map((ci) => (
                    <option key={ci.id} value={ci.id}>
                      {ci.description} ({ci.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="number" min="0.01" step="0.01"
                  name={`items[${idx}][quantity]`}
                  value={row.quantity}
                  onChange={(e) => updateRow(idx, 'quantity', Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="text" placeholder="Nota..."
                  name={`items[${idx}][notes]`}
                  value={row.notes}
                  onChange={(e) => updateRow(idx, 'notes', e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button type="button" onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-400 text-lg leading-none">×</button>
              </div>
            </div>
          ))}
        </div>

        {rows.length > 0 && (
          <div className="flex gap-6 mt-3 pt-3 border-t border-gray-800 text-sm">
            <span className="text-gray-400">Total horas: <span className="text-white font-medium">{totalHours.toFixed(2)}h</span></span>
            <span className="text-gray-400">Material est.: <span className="text-white font-medium">${totalMaterial.toFixed(2)}</span></span>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          Guardar
        </button>
        <Link href="/assemblies"
          className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
