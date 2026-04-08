import { CatalogForm } from '../form'
import { createCatalogItem } from '../actions'

export default function NewCatalogItemPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Nuevo ítem de catálogo</h2>
      <CatalogForm action={createCatalogItem} />
    </div>
  )
}
