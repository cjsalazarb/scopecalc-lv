import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createNewVersion } from '../actions'

const TABS = [
  { href: '', label: 'Overview' },
  { href: '/scope', label: 'Scope' },
  { href: '/estimate', label: 'Estimate' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/bom', label: 'BOM/RFQ' },
]

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string>> }) {
  void searchParams
  const { id } = await params
  const supabase = await createClient()

  const [{ data: project }, { data: versions }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('projects') as any).select('*').eq('id', id).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('estimate_versions') as any)
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!project) notFound()

  const activeVersion = versions?.find((v: { id: string }) => v.id === project.active_version_id) ?? versions?.[0]

  const newVersionAction = createNewVersion.bind(null, id, activeVersion?.id ?? '')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 pt-6 pb-0 bg-gray-950">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/projects" className="text-gray-500 hover:text-gray-300 text-sm">Proyectos</Link>
              <span className="text-gray-700">/</span>
              <span className="text-gray-300 text-sm">{project.name}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              {project.client && <span>{project.client}</span>}
              {project.location && <span>· {project.location}</span>}
              <span>· {project.floors} piso(s)</span>
              <span>· {project.display_unit}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <form action={newVersionAction}>
              <button type="submit" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors">
                + Nueva versión
              </button>
            </form>
            <Link href={`/projects/${id}/edit`} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors">
              Editar
            </Link>
          </div>
        </div>

        {/* Versions */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">Versiones:</span>
          {versions?.map((v: { id: string; version_label: string; status: string }) => (
            <span key={v.id} className={`px-2 py-0.5 rounded text-xs font-medium ${v.id === activeVersion?.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              {v.version_label}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <nav className="flex gap-1">
          {TABS.map((tab) => {
            const isActive = tab.href === ''
            return (
              <Link
                key={tab.href}
                href={`/projects/${id}${tab.href}`}
                className={`px-4 py-2 text-sm border-b-2 transition-colors ${isActive ? 'text-white border-blue-500' : 'text-gray-400 hover:text-white border-transparent hover:border-gray-600'}`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Overview content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Versión activa</p>
            <p className="text-2xl font-bold text-white mt-1">{activeVersion?.version_label ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-1">{activeVersion?.status}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Disciplinas</p>
            <div className="flex gap-1 flex-wrap mt-2">
              {project.disciplines.map((d: string) => (
                <span key={d} className="px-2 py-0.5 bg-blue-900 text-blue-300 rounded text-xs">{d.toUpperCase()}</span>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Pisos / Unidad</p>
            <p className="text-2xl font-bold text-white mt-1">{project.floors}</p>
            <p className="text-xs text-gray-500 mt-1">{project.display_unit}</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TABS.slice(1).map((tab) => (
            <Link key={tab.href} href={`/projects/${id}${tab.href}`}
              className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-4 text-center transition-colors">
              <p className="text-white font-medium text-sm">{tab.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
