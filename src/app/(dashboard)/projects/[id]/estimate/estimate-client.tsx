'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { addCatalogItem, addAssembly, addManualLine, updateLine, deleteLine } from './actions'

interface CatalogItem {
  id: string; description: string; unit: string
  ref_price: number | null; last_quote_price: number | null
  labor_hours_per_unit: number; category: string
}
interface Assembly { id: string; name: string; discipline: string | null }
interface EstimateLine {
  id: string; description: string | null; quantity: number
  unit_material_cost: number; unit_labor_hours: number
  source: string; override_note: string | null; snapshot_data: Record<string, unknown> | null
  catalog_item_id: string | null; assembly_id: string | null
}

const SOURCE_ICON: Record<string, string> = { actual: '🟢', last_quote: '🟡', ref: '🔵', manual: '⚪' }
const FACTORS = [
  { key: 'retrofit', label: 'Retrofit', multiplier: 1.25 },
  { key: 'occupied', label: 'Edificio ocupado', multiplier: 1.15 },
  { key: 'height', label: 'Altura >20ft', multiplier: 1.10 },
  { key: 'night', label: 'Trabajo nocturno', multiplier: 1.20 },
]

export function EstimateClient({ projectId, versionId, lines: initialLines, catalogItems, assemblies }: {
  projectId: string; versionId: string
  lines: EstimateLine[]; catalogItems: CatalogItem[]; assemblies: Assembly[]
}) {
  const [lines, setLines] = useOptimistic<EstimateLine[]>(initialLines)
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [activeFactors, setActiveFactors] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<EstimateLine>>({})
  const [manualDesc, setManualDesc] = useState('')
  const [panel, setPanel] = useState<'catalog' | 'assemblies'>('catalog')

  const totalFactor = FACTORS.reduce((acc, f) => activeFactors[f.key] ? acc * f.multiplier : acc, 1)

  const totalMaterial = lines.reduce((acc, l) => acc + l.quantity * l.unit_material_cost, 0)
  const totalHoursRaw = lines.reduce((acc, l) => acc + l.quantity * l.unit_labor_hours, 0)
  const totalHoursWithFactors = totalHoursRaw * totalFactor

  const filtered = catalogItems.filter((c) =>
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  function startEdit(line: EstimateLine) {
    setEditingId(line.id)
    setEditValues({ quantity: line.quantity, unit_material_cost: line.unit_material_cost, unit_labor_hours: line.unit_labor_hours, override_note: line.override_note ?? '' })
  }

  function saveEdit(lineId: string) {
    startTransition(async () => {
      await updateLine(lineId, projectId, {
        quantity: editValues.quantity,
        unit_material_cost: editValues.unit_material_cost,
        unit_labor_hours: editValues.unit_labor_hours,
        override_note: editValues.override_note || undefined,
      })
    })
    setEditingId(null)
  }

  function handleDelete(lineId: string) {
    setLines((prev) => prev.filter((l) => l.id !== lineId))
    startTransition(() => deleteLine(lineId, projectId))
  }

  function handleAddCatalog(itemId: string) {
    startTransition(() => addCatalogItem(versionId, projectId, itemId))
  }

  function handleAddAssembly(assemblyId: string) {
    startTransition(() => addAssembly(versionId, projectId, assemblyId))
  }

  function handleAddManual() {
    if (!manualDesc.trim()) return
    startTransition(() => addManualLine(versionId, projectId, manualDesc.trim()))
    setManualDesc('')
  }

  const groupedAssemblies = assemblies.reduce<Record<string, Assembly[]>>((acc, a) => {
    const key = a.discipline ?? 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <aside className="w-72 border-r border-gray-800 flex flex-col bg-gray-950">
        <div className="flex border-b border-gray-800">
          <button onClick={() => setPanel('catalog')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${panel === 'catalog' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            Catálogo
          </button>
          <button onClick={() => setPanel('assemblies')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${panel === 'assemblies' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            Assemblies
          </button>
        </div>

        {panel === 'catalog' && (
          <div className="flex flex-col flex-1 overflow-hidden p-3 gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ítem..."
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" />
            <div className="flex-1 overflow-y-auto space-y-1">
              {filtered.map((ci) => (
                <button key={ci.id} onClick={() => handleAddCatalog(ci.id)}
                  className="w-full text-left px-2 py-2 hover:bg-gray-800 rounded-lg transition-colors group">
                  <p className="text-white text-xs font-medium leading-tight">{ci.description}</p>
                  <p className="text-gray-500 text-xs">{ci.unit} · {SOURCE_ICON[ci.last_quote_price ? 'last_quote' : ci.ref_price ? 'ref' : 'manual']} ${(ci.last_quote_price ?? ci.ref_price ?? 0).toFixed(2)}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-1 pt-1 border-t border-gray-800">
              <input value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} placeholder="Línea manual..."
                className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" />
              <button onClick={handleAddManual} className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition-colors">+</button>
            </div>
          </div>
        )}

        {panel === 'assemblies' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {Object.entries(groupedAssemblies).map(([disc, items]) => (
              <div key={disc}>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{disc}</p>
                {items.map((a) => (
                  <button key={a.id} onClick={() => handleAddAssembly(a.id)}
                    className="w-full text-left px-2 py-2 hover:bg-gray-800 rounded-lg transition-colors mb-1">
                    <p className="text-white text-xs font-medium">{a.name}</p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Labor factors */}
        <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-4 bg-gray-950">
          <span className="text-xs text-gray-400 font-medium">Factores labor:</span>
          {FACTORS.map((f) => (
            <label key={f.key} className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={!!activeFactors[f.key]}
                onChange={(e) => setActiveFactors((prev) => ({ ...prev, [f.key]: e.target.checked }))}
                className="rounded" />
              <span className={`text-xs ${activeFactors[f.key] ? 'text-yellow-300' : 'text-gray-400'}`}>
                {f.label} (+{Math.round((f.multiplier - 1) * 100)}%)
              </span>
            </label>
          ))}
          {totalFactor > 1 && (
            <span className="text-xs text-yellow-400 ml-2">Factor total: ×{totalFactor.toFixed(3)}</span>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr className="border-b border-gray-800 text-gray-400 uppercase">
                <th className="text-left px-4 py-2">Descripción</th>
                <th className="text-right px-3 py-2 w-20">Qty</th>
                <th className="text-right px-3 py-2 w-28">Precio Unit</th>
                <th className="text-right px-3 py-2 w-24">Total Mat.</th>
                <th className="text-right px-3 py-2 w-20">Hrs Labor</th>
                <th className="text-right px-3 py-2 w-24">Total Hrs</th>
                <th className="px-3 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-2">
                    <div className="text-white">{line.description}</div>
                    {line.override_note && <div className="text-yellow-400 text-xs">✏️ {line.override_note}</div>}
                    {line.snapshot_data?.assembly_name ? (
                      <div className="text-gray-500 text-xs">Assembly: {String(line.snapshot_data.assembly_name)}</div>
                    ) : null}
                  </td>
                  {editingId === line.id ? (
                    <>
                      <td className="px-2 py-1">
                        <input type="number" min="0.01" step="0.01" value={editValues.quantity}
                          onChange={(e) => setEditValues((v) => ({ ...v, quantity: Number(e.target.value) }))}
                          className="w-full px-1 py-0.5 bg-gray-800 border border-blue-500 rounded text-white text-right text-xs" />
                      </td>
                      <td className="px-2 py-1">
                        <input type="number" min="0" step="0.01" value={editValues.unit_material_cost}
                          onChange={(e) => setEditValues((v) => ({ ...v, unit_material_cost: Number(e.target.value) }))}
                          className="w-full px-1 py-0.5 bg-gray-800 border border-blue-500 rounded text-white text-right text-xs" />
                      </td>
                      <td className="px-3 py-2 text-right text-gray-300">
                        ${((editValues.quantity ?? 0) * (editValues.unit_material_cost ?? 0)).toFixed(2)}
                      </td>
                      <td className="px-2 py-1">
                        <input type="number" min="0" step="0.01" value={editValues.unit_labor_hours}
                          onChange={(e) => setEditValues((v) => ({ ...v, unit_labor_hours: Number(e.target.value) }))}
                          className="w-full px-1 py-0.5 bg-gray-800 border border-blue-500 rounded text-white text-right text-xs" />
                      </td>
                      <td className="px-3 py-2 text-right text-gray-300">
                        {((editValues.quantity ?? 0) * (editValues.unit_labor_hours ?? 0) * totalFactor).toFixed(2)}h
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => saveEdit(line.id)} className="text-green-400 hover:text-green-300 text-xs px-1">✓</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-300 text-xs px-1">✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 text-right text-gray-300">{line.quantity}</td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-gray-300">
                          {line.unit_material_cost > 0
                            ? `${SOURCE_ICON[line.source] ?? '⚪'} $${line.unit_material_cost.toFixed(2)}`
                            : <span className="text-yellow-400">$—</span>}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-white font-medium">
                        ${(line.quantity * line.unit_material_cost).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-300">{line.unit_labor_hours.toFixed(2)}h</td>
                      <td className="px-3 py-2 text-right text-gray-300">
                        {(line.quantity * line.unit_labor_hours * totalFactor).toFixed(2)}h
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(line)} className="text-blue-400 hover:text-blue-300 text-xs">✏️</button>
                          <button onClick={() => handleDelete(line.id)} className="text-red-500 hover:text-red-400 text-xs">🗑</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Sin líneas. Agrega ítems desde el panel izquierdo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Subtotals */}
        <div className="border-t border-gray-800 px-6 py-3 bg-gray-900 flex gap-8 text-sm">
          <div>
            <span className="text-gray-400">Total material: </span>
            <span className="text-white font-semibold">${totalMaterial.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Horas sin factores: </span>
            <span className="text-white font-semibold">{totalHoursRaw.toFixed(2)}h</span>
          </div>
          <div>
            <span className="text-gray-400">Horas con factores: </span>
            <span className="text-yellow-300 font-semibold">{totalHoursWithFactors.toFixed(2)}h</span>
          </div>
          <div>
            <span className="text-gray-400">Líneas: </span>
            <span className="text-white font-semibold">{lines.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
