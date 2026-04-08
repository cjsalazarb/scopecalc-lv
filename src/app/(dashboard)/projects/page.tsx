import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = { draft: 'Borrador', active: 'Activo', closed: 'Cerrado' }
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-800 text-gray-400',
  active: 'bg-green-900 text-green-300',
  closed: 'bg-red-900 text-red-300',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; discipline?: string }>
}) {
  const { status, discipline } = await searchParams
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('projects') as any)
    .select('*, estimate_versions(version_label, status)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: projects } = await query as { data: Array<{
    id: string; name: string; client: string | null; status: string;
    disciplines: string[]; display_unit: string; created_at: string;
    estimate_versions: Array<{ version_label: string; status: string }>
  }> | null }

  const filtered = discipline
    ? projects?.filter((p) => p.disciplines.includes(discipline))
    : projects

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Proyectos</h2>
        <Link href="/projects/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Nuevo proyecto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        {['', 'draft', 'active', 'closed'].map((s) => (
          <Link key={s} href={s ? `/projects?status=${s}` : '/projects'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(status ?? '') === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            {s ? STATUS_LABELS[s] : 'Todos'}
          </Link>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
              <th className="text-left px-4 py-3">Proyecto</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Disciplinas</th>
              <th className="text-left px-4 py-3">Versión activa</th>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map((project) => (
              <tr key={project.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{project.name}</td>
                <td className="px-4 py-3 text-gray-400">{project.client ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}>
                    {STATUS_LABELS[project.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {project.disciplines.map((d) => (
                      <span key={d} className="px-1.5 py-0.5 bg-blue-900 text-blue-300 rounded text-xs">{d.toUpperCase()}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {project.estimate_versions?.[0]?.version_label ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(project.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/projects/${project.id}`} className="text-blue-400 hover:text-blue-300 text-xs">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {(!filtered || filtered.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No hay proyectos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
