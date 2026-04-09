import * as XLSX from 'xlsx'

interface BomLine {
  description: string
  category: string
  brand?: string | null
  model?: string | null
  qty: number
  unit: string
  unit_price: number | null
  total_material: number
  labor_hours: number
  source: string
}

export function generateBomXlsx(
  lines: BomLine[],
  meta: { projectName: string; versionLabel: string; date: string }
): Buffer {
  const wb = XLSX.utils.book_new()

  // Header rows
  const headerRows = [
    [`BOM — Bill of Materials`],
    [`Proyecto: ${meta.projectName}   Versión: ${meta.versionLabel}   Fecha: ${meta.date}`],
    [],
    ['#', 'Descripción', 'Categoría', 'Marca', 'Modelo', 'Qty', 'Unidad', 'Precio Unit', 'Total Material', 'Horas Labor', 'Fuente'],
  ]

  const dataRows = lines.map((l, i) => [
    i + 1,
    l.description,
    l.category,
    l.brand ?? '',
    l.model ?? '',
    l.qty,
    l.unit,
    l.unit_price != null ? l.unit_price : '',
    l.total_material,
    l.labor_hours,
    l.source,
  ])

  const totalMaterial = lines.reduce((a, l) => a + l.total_material, 0)
  const totalHours = lines.reduce((a, l) => a + l.labor_hours, 0)
  const totalsRow = ['', 'TOTALES', '', '', '', '', '', '', totalMaterial, totalHours, '']

  const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...dataRows, [], totalsRow])

  // Column widths
  ws['!cols'] = [
    { wch: 4 }, { wch: 40 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
    { wch: 6 }, { wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'BOM')

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}
