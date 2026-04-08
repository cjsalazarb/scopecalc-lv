'use client'

import Link from 'next/link'
import { useState } from 'react'

const DISCIPLINES = ['cctv', 'acs', 'intrusion', 'fire_alarm']

interface ProjectData {
  name: string
  client: string | null
  location: string | null
  disciplines: string[]
  floors: number
  display_unit: string
  notes: string | null
}

export function ProjectForm({
  action,
  project,
  cancelHref,
}: {
  action: (f: FormData) => Promise<void>
  project?: ProjectData
  cancelHref: string
}) {
  const [selected, setSelected] = useState<string[]>(project?.disciplines ?? [])

  function toggleDiscipline(d: string) {
    setSelected((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  return (
    <form action={action} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Nombre del proyecto *</label>
          <input name="name" required defaultValue={project?.name}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Cliente</label>
          <input name="client" defaultValue={project?.client ?? ''}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Ubicación</label>
          <input name="location" defaultValue={project?.location ?? ''}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-2">Disciplinas *</label>
          <div className="flex gap-2 flex-wrap">
            {DISCIPLINES.map((d) => (
              <label key={d} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="disciplines"
                  value={d}
                  checked={selected.includes(d)}
                  onChange={() => toggleDiscipline(d)}
                  className="rounded"
                />
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selected.includes(d) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                  {d.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Pisos</label>
          <input name="floors" type="number" min="1" defaultValue={project?.floors ?? 1}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Unidad de display</label>
          <select name="display_unit" defaultValue={project?.display_unit ?? 'ft'}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
            <option value="ft">ft (pies)</option>
            <option value="m">m (metros)</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Notas</label>
          <textarea name="notes" rows={2} defaultValue={project?.notes ?? ''}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          Guardar
        </button>
        <Link href={cancelHref}
          className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
