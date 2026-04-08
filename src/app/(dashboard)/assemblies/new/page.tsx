import { createClient } from '@/lib/supabase/server'
import { AssemblyForm } from '../form'
import { createAssembly } from '../actions'

export default async function NewAssemblyPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: catalogItems } = await (supabase.from('catalog_items') as any)
    .select('id, description, unit, labor_hours_per_unit, ref_price, last_quote_price')
    .eq('is_active', true)
    .order('description')

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Nuevo assembly</h2>
      <AssemblyForm action={createAssembly} catalogItems={catalogItems ?? []} />
    </div>
  )
}
