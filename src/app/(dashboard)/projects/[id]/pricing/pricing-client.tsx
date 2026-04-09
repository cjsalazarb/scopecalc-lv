'use client'

import { useState, useTransition } from 'react'
import { savePricingRules } from './actions'

interface PricingRules {
  overhead_pct: number
  contingency_pct: number
  markup_pct: number
  tax_pct: number
  labor_rate_per_hr: number
}

interface EstimateLine {
  quantity: number
  unit_material_cost: number
  unit_labor_hours: number
}

function Field({ label, value, onChange, suffix = '%' }: {
  label: string; value: number; onChange: (v: number) => void; suffix?: string
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number" min="0" step="0.1" value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{suffix}</span>
      </div>
    </div>
  )
}

export function PricingClient({ projectId, initialRules, lines }: {
  projectId: string
  initialRules: PricingRules
  lines: EstimateLine[]
}) {
  const [rules, setRules] = useState<PricingRules>(initialRules)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function set(key: keyof PricingRules, value: number) {
    setRules((r) => ({ ...r, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await savePricingRules(projectId, rules)
      setSaved(true)
    })
  }

  // Calcular totales desde las líneas del estimate
  const totalMaterialDirect = lines.reduce((acc, l) => acc + l.quantity * l.unit_material_cost, 0)
  const totalLaborHours = lines.reduce((acc, l) => acc + l.quantity * l.unit_labor_hours, 0)
  const totalLaborDirect = totalLaborHours * rules.labor_rate_per_hr

  const subtotalDirect = totalMaterialDirect + totalLaborDirect
  const consumables = subtotalDirect * 0.03
  const overhead = subtotalDirect * (rules.overhead_pct / 100)
  const contingency = (subtotalDirect + overhead) * (rules.contingency_pct / 100)
  const totalInternalCost = subtotalDirect + consumables + overhead + contingency

  const markup = totalInternalCost * (rules.markup_pct / 100)
  const netPrice = totalInternalCost + markup
  const tax = netPrice * (rules.tax_pct / 100)
  const finalPrice = netPrice + tax
  const grossMarginDollars = finalPrice - totalInternalCost
  const grossMarginPct = finalPrice > 0 ? (grossMarginDollars / finalPrice) * 100 : 0

  const itemsWithoutPrice = lines.filter((l) => l.unit_material_cost === 0).length
  const isEmpty = lines.length === 0

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Warnings */}
      {isEmpty && (
        <div className="bg-yellow-950 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-xl text-sm">
          Agrega ítems al estimate primero para ver los cálculos de pricing.
        </div>
      )}
      {!isEmpty && itemsWithoutPrice > 0 && (
        <div className="bg-yellow-950 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-xl text-sm">
          ⚠️ {itemsWithoutPrice} ítem(s) sin precio — los totales son estimados.
        </div>
      )}

      {/* Config */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Configuración</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Overhead %" value={rules.overhead_pct} onChange={(v) => set('overhead_pct', v)} />
          <Field label="Contingencia %" value={rules.contingency_pct} onChange={(v) => set('contingency_pct', v)} />
          <Field label="Markup %" value={rules.markup_pct} onChange={(v) => set('markup_pct', v)} />
          <Field label="Impuestos %" value={rules.tax_pct} onChange={(v) => set('tax_pct', v)} />
          <Field label="Tarifa labor $/h" value={rules.labor_rate_per_hr} onChange={(v) => set('labor_rate_per_hr', v)} suffix="$/h" />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleSave} disabled={pending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            {pending ? 'Guardando...' : 'Guardar configuración'}
          </button>
          {saved && <span className="text-green-400 text-sm">Guardado</span>}
        </div>
      </div>

      {/* Internal cost — fondo rojo */}
      <div className="bg-red-950/40 border border-red-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 bg-red-800 text-red-200 rounded text-xs font-bold">🔒 USO INTERNO</span>
          <h3 className="text-red-200 font-semibold">Costo Interno</h3>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="Material directo" value={totalMaterialDirect} />
          <Row label={`Labor directa (${totalLaborHours.toFixed(1)}h × $${rules.labor_rate_per_hr}/h)`} value={totalLaborDirect} />
          <RowDivider />
          <Row label="Subtotal directo" value={subtotalDirect} bold />
          <Row label="Consumibles / indirectos (3%)" value={consumables} muted />
          <Row label={`Overhead (${rules.overhead_pct}%)`} value={overhead} muted />
          <Row label={`Contingencia (${rules.contingency_pct}%)`} value={contingency} muted />
          <RowDivider />
          <Row label="COSTO TOTAL INTERNO" value={totalInternalCost} highlight="red" />
        </div>
      </div>

      {/* Client price — fondo verde */}
      <div className="bg-green-950/40 border border-green-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 bg-green-800 text-green-200 rounded text-xs font-bold">📋 PRECIO CLIENTE</span>
          <h3 className="text-green-200 font-semibold">Precio Cliente</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Costo base</span>
            <span className="text-gray-300">${totalInternalCost.toFixed(2)}</span>
          </div>
          <Row label={`Markup (${rules.markup_pct}%)`} value={markup} muted />
          <RowDivider />
          <Row label="Precio neto antes de impuestos" value={netPrice} bold />
          {rules.tax_pct > 0 && <Row label={`Impuestos (${rules.tax_pct}%)`} value={tax} muted />}
          <RowDivider />
          <Row label="PRECIO FINAL AL CLIENTE" value={finalPrice} highlight="green" />
          <RowDivider />
          <div className="flex justify-between text-gray-400 pt-1">
            <span>Margen bruto</span>
            <span className="text-green-300">${grossMarginDollars.toFixed(2)} ({grossMarginPct.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold, muted, highlight }: {
  label: string; value: number; bold?: boolean; muted?: boolean; highlight?: 'red' | 'green'
}) {
  const valueClass = highlight === 'red'
    ? 'text-red-300 font-bold text-base'
    : highlight === 'green'
    ? 'text-green-300 font-bold text-base'
    : bold ? 'text-white font-semibold' : 'text-gray-300'
  const labelClass = muted ? 'text-gray-500' : bold || highlight ? 'text-white font-semibold' : 'text-gray-400'

  return (
    <div className="flex justify-between">
      <span className={labelClass}>{label}</span>
      <span className={valueClass}>${value.toFixed(2)}</span>
    </div>
  )
}

function RowDivider() {
  return <div className="border-t border-gray-700 my-1" />
}
