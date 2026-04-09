'use client'

import { useState, useTransition } from 'react'
import { saveScope } from './actions'

export function IntrusionForm({ projectId, initialData }: { projectId: string; initialData: Record<string, unknown> }) {
  const [data, setData] = useState(initialData)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function set(key: string, value: unknown) { setData((d) => ({ ...d, [key]: value })); setSaved(false) }
  function num(key: string) { return Number(data[key] ?? 0) }
  function str(key: string, def = '') { return String(data[key] ?? def) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => { await saveScope(projectId, 'intrusion', data); setSaved(true) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">Intrusion</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Qty sensores totales *</label>
            <input type="number" min="0" value={num('qty_sensors')} onChange={(e) => set('qty_sensors', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Modelo de panel</label>
            <input type="text" value={str('panel_model')} onChange={(e) => set('panel_model', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Desglose de sensores</label>
          <div className="grid grid-cols-3 gap-3">
            {[['contacts', 'Contactos'], ['motions', 'Movimiento (PIR)'], ['glassbreak', 'Rompecristales']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input type="number" min="0" value={num(`sensor_${key}`)} onChange={(e) => set(`sensor_${key}`, Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Zonas del panel</label>
            <input type="number" min="0" value={num('panel_zones')} onChange={(e) => set('panel_zones', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Qty teclados</label>
            <input type="number" min="0" value={num('qty_keypads')} onChange={(e) => set('qty_keypads', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Sirenas interior</label>
            <input type="number" min="0" value={num('qty_sirens_indoor')} onChange={(e) => set('qty_sirens_indoor', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Sirenas exterior</label>
            <input type="number" min="0" value={num('qty_sirens_outdoor')} onChange={(e) => set('qty_sirens_outdoor', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Comunicación</label>
            <select value={str('communication', 'ip')} onChange={(e) => set('communication', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="ip">IP</option>
              <option value="cellular">Celular</option>
              <option value="dual_path">Dual Path</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Notas especiales</label>
          <textarea rows={2} value={str('special_notes')} onChange={(e) => set('special_notes', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
          {pending ? 'Guardando...' : 'Guardar scope'}
        </button>
        {saved && <span className="text-green-400 text-sm">Guardado</span>}
      </div>
    </form>
  )
}
