'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveScope(projectId: string, discipline: string, data: Record<string, unknown>) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('system_scopes') as any).upsert(
    { project_id: projectId, discipline, form_data: data },
    { onConflict: 'project_id,discipline' }
  )
}
