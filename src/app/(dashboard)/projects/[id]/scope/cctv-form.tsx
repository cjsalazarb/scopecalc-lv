'use client'

import { useState, useTransition } from 'react'
import { saveScope } from './actions'

const CAMERA_TYPES = ['ip_dome', 'ip_bullet', 'ip_ptz', 'ip_fisheye', 'analog']
const RESOLUTIONS = ['2', '4', '8', '12']

export function CctvForm({ projectId, initialData }: { projectId: string; initialData: Record<string, unknown> }) {
  const [data, setData] = useState(initialData)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function set(key: string, value: unknown) {
    setData((d) => ({ ...d, [key]: value }))
    setSaved(false)
  }

  function num(key: string) { return Number(data[key] ?? 0) }
  function str(key: string, def = '') { return String(data[key] ?? def) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await saveScope(projectId, 'cctv', data)
      setSaved(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">CCTV</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Qty cámaras *</label>
            <input type="number" min="0" value={num('qty_cameras')} onChange={(e) => set('qty_cameras', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Resolución promedio (MP)</label>
            <select value={str('avg_resolution_mp', '4')} onChange={(e) => set('avg_resolution_mp', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              {RESOLUTIONS.map((r) => <option key={r} value={r}>{r} MP</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Tipos de cámara</label>
          <div className="grid grid-cols-3 gap-2">
            {CAMERA_TYPES.map((ct) => (
              <div key={ct} className="flex items-center gap-2">
                <span className="text-gray-400 text-xs w-20">{ct}</span>
                <input type="number" min="0" value={num(`camera_type_${ct}`)}
                  onChange={(e) => set(`camera_type_${ct}`, Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Interior / Exterior</label>
            <select value={str('interior_exterior_ratio', 'mixed')} onChange={(e) => set('interior_exterior_ratio', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="all_interior">Todo interior</option>
              <option value="mixed">Mixto</option>
              <option value="all_exterior">Todo exterior</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Retención (días)</label>
            <input type="number" min="0" value={num('retention_days')} onChange={(e) => set('retention_days', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">NVR/VMS tipo</label>
            <select value={str('nvr_vms_type', 'nvr')} onChange={(e) => set('nvr_vms_type', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="nvr">NVR</option>
              <option value="vms">VMS</option>
              <option value="cloud">Cloud</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Modelo NVR/VMS</label>
            <input type="text" value={str('nvr_vms_model')} onChange={(e) => set('nvr_vms_model', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Qty switches</label>
            <input type="number" min="0" value={num('qty_switches')} onChange={(e) => set('qty_switches', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Qty IDFs</label>
            <input type="number" min="0" value={num('qty_idfs')} onChange={(e) => set('qty_idfs', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="poe" checked={Boolean(data.poe_enabled)} onChange={(e) => set('poe_enabled', e.target.checked)}
            className="rounded" />
          <label htmlFor="poe" className="text-sm text-gray-300">PoE habilitado</label>
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
