'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface Category { value: string; label: string }

export function CatalogFilters({
  categories,
  currentCategory,
  currentQ,
}: {
  categories: Category[]
  currentCategory?: string
  currentQ?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams()
    if (key !== 'category' && currentCategory) params.set('category', currentCategory)
    if (key !== 'q' && currentQ) params.set('q', currentQ)
    if (value) params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, currentCategory, currentQ])

  return (
    <div className="flex gap-3 mb-4">
      <input
        type="text"
        defaultValue={currentQ}
        placeholder="Buscar por descripción..."
        onChange={(e) => update('q', e.target.value)}
        className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
      />
      <select
        value={currentCategory ?? ''}
        onChange={(e) => update('category', e.target.value)}
        className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
      >
        {categories.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
    </div>
  )
}
