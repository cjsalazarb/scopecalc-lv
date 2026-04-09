import * as XLSX from 'xlsx'

interface RfqLine {
  description: string
  category: string
  qty: number
  unit: string
}

export function generateRfqXlsx(
  lines: RfqLine[],
  meta: { projectName: string; vendorName: string; date: string; contactName?: string }
): Buffer {
  const wb = XLSX.utils.book_new()

  const headerRows = [
    [`SOLICITUD DE COTIZACIÓN (RFQ)`],
    [`Proyecto: ${meta.projectName}`],
    [`Proveedor: ${meta.vendorName}   Fecha: ${meta.date}`],
    meta.contactName ? [`Solicitado por: ${meta.contactName}`] : [],
    [],
    ['#', 'Descripción', 'Categoría', 'Qty', 'Unidad', 'Precio Unitario ($)', 'Lead Time (días)', 'Notas'],
  ].filter((r) => r.length > 0)

  const dataRows = lines.map((l, i) => [
    i + 1,
    l.description,
    l.category,
    l.qty,
    l.unit,
    '',  // proveedor llena
    '',  // proveedor llena
    '',  // proveedor llena
  ])

  const noteRow = [[], ['Completar precios unitarios y devolver a solicitante. Precios en USD.']]

  const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...dataRows, ...noteRow])

  ws['!cols'] = [
    { wch: 4 }, { wch: 40 }, { wch: 14 }, { wch: 6 }, { wch: 8 },
    { wch: 18 }, { wch: 16 }, { wch: 20 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'RFQ')

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}
