import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import UploadForm from './upload-form'
import { deletePlanFile } from './actions'

const SCALE_TYPE_LABELS: Record<string, string> = {
  architectural: 'Arquitectónica USA',
  ratio: 'Ratio',
  manual: 'Manual',
}

const ARCH_SCALE_LABELS: Record<string, string> = {
  '1/8': '1/8"=1\'',
  '1/4': '1/4"=1\'',
  '3/8': '3/8"=1\'',
  '1/2': '1/2"=1\'',
  '3/4': '3/4"=1\'',
  '1': '1"=1\'',
  '1=10': '1"=10\'',
  '1=20': '1"=20\'',
}

function formatScaleLabel(file: {
  scale_type: string | null
  scale_arch: string | null
  scale_ratio: number | null
  scale_factor: number | null
  scale_unit: string | null
}) {
  if (file.scale_type === 'architectural' && file.scale_arch) {
    return ARCH_SCALE_LABELS[file.scale_arch] ?? file.scale_arch
  }
  if (file.scale_type === 'ratio' && file.scale_ratio) {
    return `1:${file.scale_ratio} ${file.scale_unit}`
  }
  if (file.scale_type === 'manual' && file.scale_factor) {
    return `×${file.scale_factor} ${file.scale_unit}`
  }
  return '—'
}

export default async function PlansPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: project }, { data: files }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('projects') as any).select('id, name').eq('id', id).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('project_files') as any)
      .select('*')
      .eq('project_id', id)
      .order('uploaded_at', { ascending: false }),
  ])

  if (!project) notFound()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 pt-6 pb-0 bg-gray-950">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/projects" className="text-gray-500 hover:text-gray-300 text-sm">Proyectos</Link>
              <span className="text-gray-700">/</span>
              <Link href={`/projects/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">{project.name}</Link>
              <span className="text-gray-700">/</span>
              <span className="text-gray-300 text-sm">Planos</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Planos — {project.name}</h2>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1">
          {[
            { href: `/projects/${id}`, label: 'Overview' },
            { href: `/projects/${id}/scope`, label: 'Scope' },
            { href: `/projects/${id}/estimate`, label: 'Estimate' },
            { href: `/projects/${id}/pricing`, label: 'Pricing' },
            { href: `/projects/${id}/bom`, label: 'BOM/RFQ' },
            { href: `/projects/${id}/plans`, label: 'Planos', active: true },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                tab.active
                  ? 'text-white border-blue-500'
                  : 'text-gray-400 hover:text-white border-transparent hover:border-gray-600'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-8 space-y-8">
        {/* Upload section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Subir plano</h3>
          <UploadForm projectId={id} />
        </div>

        {/* Files list */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Archivos subidos</h3>
            <p className="text-gray-500 text-sm">{files?.length ?? 0} archivo(s)</p>
          </div>

          {(!files || files.length === 0) ? (
            <div className="px-6 py-10 text-center text-gray-500 text-sm">
              No hay planos subidos aún.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                  <th className="px-6 py-3 text-left">Nombre</th>
                  <th className="px-6 py-3 text-left">Etiqueta</th>
                  <th className="px-4 py-3 text-center">Piso</th>
                  <th className="px-4 py-3 text-center">Tipo</th>
                  <th className="px-6 py-3 text-left">Tipo de escala</th>
                  <th className="px-6 py-3 text-left">Escala</th>
                  <th className="px-6 py-3 text-left">Factor (ft)</th>
                  <th className="px-6 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {files.map((file: any) => (
                  <tr key={file.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="px-6 py-3 text-gray-200 font-medium">
                      {file.storage_path.split('/').pop()}
                    </td>
                    <td className="px-6 py-3 text-gray-400">{file.file_label || '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-400">{file.floor_number}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        file.file_type === 'dxf'
                          ? 'bg-blue-900 text-blue-300'
                          : 'bg-purple-900 text-purple-300'
                      }`}>
                        {file.file_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">
                      {SCALE_TYPE_LABELS[file.scale_type] ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-400">{formatScaleLabel(file)}</td>
                    <td className="px-6 py-3 text-gray-300 font-mono text-xs">
                      {file.scale_factor != null ? `×${parseFloat(file.scale_factor).toFixed(4)}` : '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {new Date(file.uploaded_at).toLocaleDateString('es', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {file.file_type === 'dxf' && (
                          <Link
                            href={`/projects/${id}/plans/${file.id}`}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Analizar
                          </Link>
                        )}
                        <form
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          action={deletePlanFile.bind(null, file.id, file.storage_path, id) as any}
                        >
                          <button
                            type="submit"
                            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                          >
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
