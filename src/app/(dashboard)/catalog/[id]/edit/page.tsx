import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CatalogForm } from '../../form'
import { updateCatalogItem } from '../../actions'

export default async function EditCatalogItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase.from('catalog_items') as any).select('*').eq('id', id).single()

  if (!item) notFound()

  const action = updateCatalogItem.bind(null, id)

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Editar ítem</h2>
      <CatalogForm action={action} item={item} />
    </div>
  )
}
