import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: projectCount }, { count: catalogCount }] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('catalog_items').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Proyectos activos</p>
          <p className="text-3xl font-bold text-white mt-1">{projectCount ?? 0}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Ítems en catálogo</p>
          <p className="text-3xl font-bold text-white mt-1">{catalogCount ?? 0}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Estado</p>
          <p className="text-sm font-medium text-green-400 mt-1">Sistema operativo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/projects/new" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 transition-colors block">
          <p className="font-semibold">Nuevo proyecto</p>
          <p className="text-sm text-blue-200 mt-1">Crear estimación CCTV, ACS, Intrusion o Fire Alarm</p>
        </Link>
        <Link href="/catalog" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white rounded-xl p-5 transition-colors block">
          <p className="font-semibold">Ver catálogo</p>
          <p className="text-sm text-gray-400 mt-1">Gestionar materiales y precios</p>
        </Link>
      </div>
    </div>
  )
}
