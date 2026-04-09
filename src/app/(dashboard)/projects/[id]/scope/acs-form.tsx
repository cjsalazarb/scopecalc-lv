'use client'

import { useState, useTransition } from 'react'
import { saveScope } from './actions'

export function AcsForm({ projectId, initialData }: { projectId: string; initialData: Record<string, unknown> }) {
  const [data, setData] = useState(initialData)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function set(key: string, value: unknown) { setData((d) => ({ ...d, [key]: value })); setSaved(false) }
  function num(key: string) { return Number(data[key] ?? 0) }
  function str(key: string, def = '') { return String(data[key] ?? def) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => { await saveScope(projectId, 'acs', data); setSaved(true) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">ACS</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Qty puertas *</label>
            <input type="number" min="0" value={num('qty_doors')} onChange={(e) => set('qty_doors', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Qty paneles</label>
            <input type="number" min="0" value={num('qty_panels')} onChange={(e) => set('qty_panels', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Configuración de lectores</label>
            <select value={str('reader_config', 'all_single')} onChange={(e) => set('reader_config', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="all_single">Todo single</option>
              <option value="mixed">Mixto</option>
              <option value="all_dual">Todo dual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Hardware de puerta</label>
            <select value={str('door_hardware', 'maglock')} onChange={(e) => set('door_hardware', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="maglock">Maglock</option>
              <option value="electric_strike">Electric Strike</option>
              <option value="crash_bar">Crash Bar</option>
              <option value="electrified_hw">Electrified HW</option>
              <option value="mixed">Mixto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Modelo de panel</label>
            <input type="text" value={str('panel_model')} onChange={(e) => set('panel_model', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tipo de cable</label>
            <select value={str('cable_type', '18_6_shielded')} onChange={(e) => set('cable_type', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="18_6_shielded">18/6 Shielded</option>
              <option value="cat6">Cat6</option>
              <option value="multi_conductor">Multi-conductor</option>
              <option value="mixed">Mixto</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {[
            ['external_power_supply', 'Fuente de poder externa'],
            ['fire_alarm_integration', 'Integración Fire Alarm'],
            ['video_intercom', 'Video intercom'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <input type="checkbox" id={key} checked={Boolean(data[key])} onChange={(e) => set(key, e.target.checked)} className="rounded" />
              <label htmlFor={key} className="text-sm text-gray-300">{label}</label>
            </div>
          ))}
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
