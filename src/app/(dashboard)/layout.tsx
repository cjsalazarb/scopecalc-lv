import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">ScopeCalc LV</h1>
          <p className="text-xs text-gray-500">Low Voltage Estimator</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors">
            Dashboard
          </Link>
          <Link href="/projects" className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors">
            Proyectos
          </Link>
          <Link href="/catalog" className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors">
            Catálogo
          </Link>
          <Link href="/assemblies" className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors">
            Assemblies
          </Link>
        </nav>
        <div className="p-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 px-3 mb-1 truncate">{user.email}</p>
          <Link href="/logout" className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg text-sm transition-colors w-full">
            Cerrar sesión
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
