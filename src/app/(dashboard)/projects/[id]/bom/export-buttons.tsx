'use client'

export function ExportButtons({ projectId }: { projectId: string }) {
  const base = `/api/exports`
  const params = `project_id=${projectId}`

  function download(type: string) {
    window.open(`${base}/${type}?${params}`, '_blank')
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => download('bom')}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-700"
      >
        📊 Exportar BOM
      </button>
      <button
        onClick={() => download('rfq')}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-700"
      >
        📋 Exportar RFQ
      </button>
      <button
        onClick={() => download('cost_sheet')}
        className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-200 rounded-lg text-sm font-medium transition-colors border border-red-700"
      >
        🔒 Cost Sheet Interno
      </button>
      <button
        onClick={() => download('proposal')}
        className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 rounded-lg text-sm font-medium transition-colors border border-green-700"
      >
        📄 Propuesta Cliente
      </button>
    </div>
  )
}
