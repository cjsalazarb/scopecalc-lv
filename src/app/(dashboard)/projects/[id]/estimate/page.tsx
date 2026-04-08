import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EstimatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase.from('projects') as any).select('name').eq('id', id).single()
  if (!project) notFound()

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/projects/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">← {project.name}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-300 text-sm font-medium">Estimate</span>
      </div>
      <p className="text-gray-500">Módulo Estimate — se implementa en P0-08.</p>
    </div>
  )
}
