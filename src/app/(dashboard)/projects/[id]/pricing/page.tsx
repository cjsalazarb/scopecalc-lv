import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PricingClient } from './pricing-client'

export default async function PricingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: project }, { data: rules }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('projects') as any).select('name, active_version_id').eq('id', id).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('pricing_rules') as any).select('*').eq('project_id', id).single(),
  ])

  if (!project) notFound()

  let lines = []
  if (project.active_version_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('estimate_lines') as any)
      .select('quantity, unit_material_cost, unit_labor_hours')
      .eq('estimate_version_id', project.active_version_id)
    lines = data ?? []
  }

  const defaultRules = {
    overhead_pct: 10, contingency_pct: 5, markup_pct: 20, tax_pct: 0, labor_rate_per_hr: 65,
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/projects/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">← {project.name}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-300 text-sm font-medium">Pricing</span>
      </div>
      <PricingClient
        projectId={id}
        initialRules={rules ?? defaultRules}
        lines={lines}
      />
    </div>
  )
}
