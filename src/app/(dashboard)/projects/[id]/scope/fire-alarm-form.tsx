'use client'

import { useState, useTransition } from 'react'
import { saveScope } from './actions'

export function FireAlarmForm({ projectId, initialData }: { projectId: string; initialData: Record<string, unknown> }) {
  const [data, setData] = useState(initialData)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function set(key: string, value: unknown) { setData((d) => ({ ...d, [key]: value })); setSaved(false) }
  function num(key: string) { return Number(data[key] ?? 0) }
  function str(key: string, def = '') { return String(data[key] ?? def) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => { await saveScope(projectId, 'fire_alarm', data); setSaved(true) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">Fire Alarm</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tipo de sistema</label>
            <select value={str('system_type', 'addressable')} onChange={(e) => set('system_type', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="addressable">Addressable</option>
              <option value="conventional">Conventional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Modelo de panel</label>
            <input type="text" value={str('panel_model')} onChange={(e) => set('panel_model', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Loops del panel</label>
            <input type="number" min="0" value={num('panel_loops')} onChange={(e) => set('panel_loops', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">NACs del panel</label>
            <input type="number" min="0" value={num('panel_nacs')} onChange={(e) => set('panel_nacs', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Detectores</label>
          <div className="grid grid-cols-3 gap-3">
            {[['smoke', 'Humo'], ['heat', 'Calor'], ['combo', 'Combo']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input type="number" min="0" value={num(`qty_detectors_${key}`)} onChange={(e) => set(`qty_detectors_${key}`, Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Dispositivos NAC</label>
          <div className="grid grid-cols-2 gap-3">
            {[['horn_strobe', 'Horn Strobe'], ['speaker', 'Speaker']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input type="number" min="0" value={num(`nac_${key}`)} onChange={(e) => set(`nac_${key}`, Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Qty módulos</label>
            <input type="number" min="0" value={num('qty_modules')} onChange={(e) => set('qty_modules', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Qty boosters</label>
            <input type="number" min="0" value={num('qty_boosters')} onChange={(e) => set('qty_boosters', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tipo de cable</label>
            <select value={str('cable_type', 'fplp')} onChange={(e) => set('cable_type', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="fplp">FPLP</option>
              <option value="fplr">FPLR</option>
              <option value="ci">CI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Días de programación</label>
            <input type="number" min="0" value={num('programming_days')} onChange={(e) => set('programming_days', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="include_programming" checked={Boolean(data.include_programming)} onChange={(e) => set('include_programming', e.target.checked)} className="rounded" />
          <label htmlFor="include_programming" className="text-sm text-gray-300">Incluir programación</label>
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
