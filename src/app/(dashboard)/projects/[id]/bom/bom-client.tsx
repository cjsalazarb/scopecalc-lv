'use client'

import { useState, useTransition } from 'react'
import { createRFQ, saveQuoteLines, applyQuoteToEstimate } from './actions'

interface BomItem {
  catalog_item_id: string; description: string; category: string
  unit: string; ref_price: number | null; last_quote_price: number | null
  qty: number; source: string
}

interface QuoteLine {
  catalog_item_id: string; unit_price: number; lead_time_days: number; notes: string
}

interface RFQ {
  id: string; vendor_name: string; status: string; created_at: string
  vendor_quote_lines: { catalog_item_id: string; unit_price: number; lead_time_days: number | null; notes: string | null }[]
}

const SOURCE_ICON: Record<string, string> = { actual: '🟢', last_quote: '🟡', ref: '🔵', manual: '⚪' }

function bestPrice(item: BomItem) {
  return item.last_quote_price ?? item.ref_price ?? null
}

function sourceLabel(item: BomItem) {
  if (item.last_quote_price != null) return '🟡'
  if (item.ref_price != null) return '🔵'
  return '⚪'
}

export function BomClient({ projectId, versionId, bom, rfqs }: {
  projectId: string; versionId: string; bom: BomItem[]; rfqs: RFQ[]
}) {
  const [, startTransition] = useTransition()
  const [vendorName, setVendorName] = useState('')
  const [showRfqModal, setShowRfqModal] = useState(false)
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null)
  const [quoteInputs, setQuoteInputs] = useState<Record<string, QuoteLine>>({})

  const totalItems = bom.length
  const totalMaterial = bom.reduce((acc, item) => acc + item.qty * (bestPrice(item) ?? 0), 0)
  const itemsWithoutPrice = bom.filter((item) => bestPrice(item) == null).length

  function openRfq(rfq: RFQ) {
    setSelectedRfq(rfq)
    // Pre-cargar valores existentes
    const inputs: Record<string, QuoteLine> = {}
    for (const item of bom) {
      const existing = rfq.vendor_quote_lines.find((l) => l.catalog_item_id === item.catalog_item_id)
      inputs[item.catalog_item_id] = {
        catalog_item_id: item.catalog_item_id,
        unit_price: existing?.unit_price ?? 0,
        lead_time_days: existing?.lead_time_days ?? 0,
        notes: existing?.notes ?? '',
      }
    }
    setQuoteInputs(inputs)
  }

  function handleCreateRFQ() {
    if (!vendorName.trim()) return
    startTransition(() => createRFQ(versionId, projectId, vendorName.trim()))
    setVendorName('')
    setShowRfqModal(false)
  }

  function handleSaveQuote() {
    if (!selectedRfq) return
    const lines = Object.values(quoteInputs)
    startTransition(() => saveQuoteLines(selectedRfq.id, projectId, lines))
    setSelectedRfq(null)
  }

  function handleApply(rfqId: string) {
    startTransition(() => applyQuoteToEstimate(rfqId, versionId, projectId))
  }

  const receivedRfqs = rfqs.filter((r) => r.status === 'received')

  return (
    <div className="space-y-6">
      {/* Sección 1 — BOM */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">BOM — Bill of Materials</h3>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>{totalItems} ítems</span>
            <span>Total: <span className="text-white font-medium">${totalMaterial.toFixed(2)}</span></span>
            {itemsWithoutPrice > 0 && <span className="text-yellow-400">⚠️ {itemsWithoutPrice} sin precio</span>}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
              <th className="text-left px-4 py-2">Descripción</th>
              <th className="text-left px-4 py-2">Cat.</th>
              <th className="text-right px-4 py-2">Qty</th>
              <th className="text-left px-4 py-2">Unidad</th>
              <th className="text-right px-4 py-2">Precio Ref</th>
              <th className="text-right px-4 py-2">Última Cot</th>
              <th className="text-right px-4 py-2">Precio Actual</th>
              <th className="text-right px-4 py-2">Total</th>
              <th className="text-center px-4 py-2">Fuente</th>
            </tr>
          </thead>
          <tbody>
            {bom.map((item) => {
              const price = bestPrice(item)
              return (
                <tr key={item.catalog_item_id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-2 text-white">{item.description}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{item.category}</td>
                  <td className="px-4 py-2 text-right text-gray-300">{item.qty}</td>
                  <td className="px-4 py-2 text-gray-400">{item.unit}</td>
                  <td className="px-4 py-2 text-right text-gray-400">{item.ref_price != null ? `$${item.ref_price.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-2 text-right text-gray-400">{item.last_quote_price != null ? `$${item.last_quote_price.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-2 text-right text-white font-medium">{price != null ? `$${price.toFixed(2)}` : <span className="text-yellow-400">$—</span>}</td>
                  <td className="px-4 py-2 text-right text-white">{price != null ? `$${(item.qty * price).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-2 text-center">{SOURCE_ICON[item.source] ?? sourceLabel(item)}</td>
                </tr>
              )
            })}
            {bom.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Sin ítems en el estimate.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sección 2 — RFQs */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Gestión RFQ</h3>
          <button onClick={() => setShowRfqModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            + Crear RFQ
          </button>
        </div>

        {showRfqModal && (
          <div className="mb-4 flex gap-2">
            <input value={vendorName} onChange={(e) => setVendorName(e.target.value)}
              placeholder="Nombre del proveedor..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRFQ()}
            />
            <button onClick={handleCreateRFQ} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Crear</button>
            <button onClick={() => setShowRfqModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">Cancelar</button>
          </div>
        )}

        {rfqs.length === 0 && <p className="text-gray-500 text-sm">No hay RFQs creados.</p>}

        <div className="space-y-2">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <div>
                <span className="text-white font-medium text-sm">{rfq.vendor_name}</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                  rfq.status === 'received' ? 'bg-green-900 text-green-300'
                  : rfq.status === 'sent' ? 'bg-blue-900 text-blue-300'
                  : 'bg-gray-700 text-gray-400'
                }`}>{rfq.status}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openRfq(rfq)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors">
                  {rfq.status === 'received' ? 'Ver / Editar precios' : 'Cargar precios'}
                </button>
                {rfq.status === 'received' && (
                  <button onClick={() => handleApply(rfq.id)}
                    className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs transition-colors">
                    Aplicar al estimate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección 3 — Carga de cotización */}
      {selectedRfq && (
        <div className="bg-gray-900 border border-blue-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Cotización: {selectedRfq.vendor_name}</h3>
            <button onClick={() => setSelectedRfq(null)} className="text-gray-500 hover:text-gray-300 text-sm">✕ Cerrar</button>
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                <th className="text-left px-3 py-2">Ítem</th>
                <th className="text-left px-3 py-2">Qty</th>
                <th className="text-right px-3 py-2 w-32">Precio Unit ($)</th>
                <th className="text-right px-3 py-2 w-24">Lead time (días)</th>
                <th className="text-left px-3 py-2">Notas</th>
              </tr>
            </thead>
            <tbody>
              {bom.map((item) => {
                const input = quoteInputs[item.catalog_item_id] ?? { unit_price: 0, lead_time_days: 0, notes: '' }
                return (
                  <tr key={item.catalog_item_id} className="border-b border-gray-800">
                    <td className="px-3 py-2 text-white">{item.description}</td>
                    <td className="px-3 py-2 text-gray-400">{item.qty} {item.unit}</td>
                    <td className="px-2 py-1">
                      <input type="number" min="0" step="0.01" value={input.unit_price}
                        onChange={(e) => setQuoteInputs((prev) => ({ ...prev, [item.catalog_item_id]: { ...input, unit_price: Number(e.target.value) } }))}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-right text-xs focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-2 py-1">
                      <input type="number" min="0" value={input.lead_time_days}
                        onChange={(e) => setQuoteInputs((prev) => ({ ...prev, [item.catalog_item_id]: { ...input, lead_time_days: Number(e.target.value) } }))}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-right text-xs focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-2 py-1">
                      <input type="text" value={input.notes}
                        onChange={(e) => setQuoteInputs((prev) => ({ ...prev, [item.catalog_item_id]: { ...input, notes: e.target.value } }))}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-blue-500" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <button onClick={handleSaveQuote}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Guardar cotización
          </button>
        </div>
      )}

      {/* Sección 4 — Bid Tab */}
      {receivedRfqs.length >= 2 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Bid Tab — Comparativo de precios</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase">
                <th className="text-left px-3 py-2">Ítem</th>
                {receivedRfqs.map((r) => (
                  <th key={r.id} className="text-right px-3 py-2">{r.vendor_name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bom.map((item) => {
                const prices = receivedRfqs.map((r) => {
                  const line = r.vendor_quote_lines.find((l) => l.catalog_item_id === item.catalog_item_id)
                  return line?.unit_price ?? null
                })
                const minPrice = Math.min(...prices.filter((p): p is number => p !== null))
                return (
                  <tr key={item.catalog_item_id} className="border-b border-gray-800">
                    <td className="px-3 py-2 text-white">{item.description}</td>
                    {prices.map((price, idx) => (
                      <td key={idx} className={`px-3 py-2 text-right font-medium ${price === minPrice && price !== null ? 'text-green-400' : 'text-gray-300'}`}>
                        {price != null ? `$${price.toFixed(2)}` : '—'}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
