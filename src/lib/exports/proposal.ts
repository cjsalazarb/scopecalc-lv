import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ProposalLine {
  description: string
  category: string
  qty: number
  unit: string
}

interface Scope {
  discipline: string
  summary: string
}

export function generateProposalPdf(
  lines: ProposalLine[],
  scopes: Scope[],
  finalPrice: number,
  meta: { projectName: string; clientName: string; versionLabel: string; date: string; location?: string }
): Buffer {
  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()

  // ── Portada ──
  doc.setFillColor(17, 24, 39)
  doc.rect(0, 0, pageW, 60, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('PROPUESTA TÉCNICA', pageW / 2, 25, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(meta.projectName, pageW / 2, 35, { align: 'center' })

  doc.setFontSize(10)
  doc.text(`Cliente: ${meta.clientName}`, pageW / 2, 44, { align: 'center' })
  doc.text(`${meta.date}   ·   ${meta.versionLabel}${meta.location ? `   ·   ${meta.location}` : ''}`, pageW / 2, 51, { align: 'center' })

  doc.setTextColor(0, 0, 0)

  // ── Resumen Ejecutivo ──
  let y = 75
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen Ejecutivo', 14, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)

  for (const scope of scopes) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(scope.discipline.toUpperCase(), 14, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const lines2 = doc.splitTextToSize(scope.summary, pageW - 28)
    doc.text(lines2, 14, y)
    y += lines2.length * 5 + 4
  }

  // ── Equipos Principales ──
  y += 4
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Equipos Principales', 14, y)
  y += 4

  // Agrupar por categoría
  const grouped = lines.reduce<Record<string, ProposalLine[]>>((acc, l) => {
    if (!acc[l.category]) acc[l.category] = []
    acc[l.category].push(l)
    return acc
  }, {})

  const tableBody = Object.entries(grouped).flatMap(([cat, items]) => [
    [{ content: cat.toUpperCase(), colSpan: 3, styles: { fillColor: [243, 244, 246] as [number, number, number], fontStyle: 'bold' as const, fontSize: 9 } }],
    ...items.map((i) => [i.description, i.qty, i.unit]),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Descripción', 'Cantidad', 'Unidad']],
    body: tableBody,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [17, 24, 39] },
    columnStyles: { 1: { halign: 'center', cellWidth: 25 }, 2: { halign: 'center', cellWidth: 20 } },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10

  // ── Precio Total ──
  doc.setFillColor(243, 244, 246)
  doc.rect(14, y, pageW - 28, 18, 'F')
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('PRECIO TOTAL DEL PROYECTO', 20, y + 8)
  doc.setFontSize(16)
  doc.text(`$${finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`, pageW - 20, y + 10, { align: 'right' })
  y += 26

  // ── Exclusiones ──
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Exclusiones del Alcance', 14, y)
  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  const exclusions = [
    'Obras civiles, albañilería o construcción estructural',
    'Trabajos eléctricos de alimentación principal',
    'Licencias de software no especificadas en esta propuesta',
    'Mantenimiento preventivo o correctivo posterior a garantía',
  ]
  exclusions.forEach((exc) => { doc.text(`• ${exc}`, 18, y); y += 5 })

  // ── Validez ──
  y += 4
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.text('Esta propuesta tiene una validez de 30 días a partir de la fecha de emisión.', 14, y)

  // ── Footer ──
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text(`Propuesta preparada con ScopeCalc LV  ·  Página ${i} de ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' })
  }

  return Buffer.from(doc.output('arraybuffer'))
}
