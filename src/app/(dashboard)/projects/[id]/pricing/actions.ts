'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function savePricingRules(projectId: string, rules: {
  overhead_pct: number
  contingency_pct: number
  markup_pct: number
  tax_pct: number
  labor_rate_per_hr: number
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('pricing_rules') as any)
    .upsert({ project_id: projectId, ...rules }, { onConflict: 'project_id' })
  revalidatePath(`/projects/${projectId}/pricing`)
}
