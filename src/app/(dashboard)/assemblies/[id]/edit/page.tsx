import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AssemblyForm } from '../../form'
import { updateAssembly } from '../../actions'

export default async function EditAssemblyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: assembly }, { data: catalogItems }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('assemblies') as any)
      .select('*, assembly_items(catalog_item_id, quantity, notes)')
      .eq('id', id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('catalog_items') as any)
      .select('id, description, unit, labor_hours_per_unit, ref_price, last_quote_price')
      .eq('is_active', true)
      .order('description'),
  ])

  if (!assembly) notFound()

  const action = updateAssembly.bind(null, id)

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Editar assembly</h2>
      <AssemblyForm action={action} assembly={assembly} catalogItems={catalogItems ?? []} />
    </div>
  )
}
