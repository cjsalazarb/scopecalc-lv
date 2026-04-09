import * as XLSX from 'xlsx'

interface CostLine {
  description: string
  category: string
  qty: number
  unit: string
  unit_price: number
  total_material: number
  unit_labor_hours: number
  total_labor_hours: number
}

interface PricingRules {
  overhead_pct: number
  contingency_pct: number
  markup_pct: number
  tax_pct: number
  labor_rate_per_hr: number
}

export function generateCostSheetXlsx(
  lines: CostLine[],
  rules: PricingRules,
  meta: { projectName: string; versionLabel: string; date: string }
): Buffer {
  const wb = XLSX.utils.book_new()

  const totalMaterial = lines.reduce((a, l) => a + l.total_material, 0)
  const totalHours = lines.reduce((a, l) => a + l.total_labor_hours, 0)
  const totalLabor = totalHours * rules.labor_rate_per_hr
  const subtotal = totalMaterial + totalLabor
  const consumables = subtotal * 0.03
  const overhead = subtotal * (rules.overhead_pct / 100)
  const contingency = (subtotal + overhead) * (rules.contingency_pct / 100)
  const totalCost = subtotal + consumables + overhead + contingency
  const markup = totalCost * (rules.markup_pct / 100)
  const netPrice = totalCost + markup
  const tax = netPrice * (rules.tax_pct / 100)
  const finalPrice = netPrice + tax

  // Hoja 1 — Cost Sheet
  const sheet1Rows = [
    ['⚠️  DOCUMENTO INTERNO — NO COMPARTIR CON CLIENTE  ⚠️'],
    [],
    [`Cost Sheet — ${meta.projectName}`],
    [`Versión: ${meta.versionLabel}   Fecha: ${meta.date}`],
    [],
    ['DESGLOSE DE COSTOS', '', ''],
    ['Material directo', '', `$${totalMaterial.toFixed(2)}`],
    [`Labor directa (${totalHours.toFixed(2)}h × $${rules.labor_rate_per_hr}/h)`, '', `$${totalLabor.toFixed(2)}`],
    ['Subtotal directo', '', `$${subtotal.toFixed(2)}`],
    ['Consumibles / indirectos (3%)', '', `$${consumables.toFixed(2)}`],
    [`Overhead (${rules.overhead_pct}%)`, '', `$${overhead.toFixed(2)}`],
    [`Contingencia (${rules.contingency_pct}%)`, '', `$${contingency.toFixed(2)}`],
    ['COSTO TOTAL INTERNO', '', `$${totalCost.toFixed(2)}`],
    [],
    [`Markup (${rules.markup_pct}%)`, '', `$${markup.toFixed(2)}`],
    ['Precio neto', '', `$${netPrice.toFixed(2)}`],
    rules.tax_pct > 0 ? [`Impuestos (${rules.tax_pct}%)`, '', `$${tax.toFixed(2)}`] : ['', '', ''],
    ['PRECIO FINAL AL CLIENTE', '', `$${finalPrice.toFixed(2)}`],
    [],
    ['Margen bruto', '', `${((grossMargin(totalCost, finalPrice))).toFixed(1)}%`],
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Rows)
  ws1['!cols'] = [{ wch: 40 }, { wch: 10 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Cost Sheet')

  // Hoja 2 — Detalle Labor
  const sheet2Header = [
    ['DETALLE LABOR — INTERNO'],
    [],
    ['Descripción', 'Qty', 'Horas/Unit', 'Total Horas', 'Tarifa', 'Total Labor'],
  ]
  const sheet2Rows = lines.map((l) => [
    l.description,
    l.qty,
    l.unit_labor_hours,
    l.total_labor_hours,
    rules.labor_rate_per_hr,
    (l.total_labor_hours * rules.labor_rate_per_hr).toFixed(2),
  ])
  const ws2 = XLSX.utils.aoa_to_sheet([...sheet2Header, ...sheet2Rows])
  ws2['!cols'] = [{ wch: 36 }, { wch: 6 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Detalle Labor')

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}

function grossMargin(cost: number, price: number) {
  if (price === 0) return 0
  return ((price - cost) / price) * 100
}
