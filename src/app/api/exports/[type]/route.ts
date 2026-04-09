import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateBomXlsx } from '@/lib/exports/bom'
import { generateRfqXlsx } from '@/lib/exports/rfq'
import { generateCostSheetXlsx } from '@/lib/exports/costsheet'
import { generateProposalPdf } from '@/lib/exports/proposal'

function today() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  const { searchParams } = request.nextUrl
  const projectId = searchParams.get('project_id')
  const versionId = searchParams.get('version_id')

  if (!projectId) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase.from('projects') as any)
    .select('name, client, location, active_version_id, display_unit')
    .eq('id', projectId).single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const vid = versionId ?? project.active_version_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: version } = await (supabase.from('estimate_versions') as any)
    .select('version_label').eq('id', vid).single()

  const versionLabel = version?.version_label ?? 'V1'
  const date = today()
  const fileSlug = `${slug(project.name)}_${versionLabel}_${date.replace(/\//g, '')}`

  // Fetch estimate lines with catalog info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lines } = await (supabase.from('estimate_lines') as any)
    .select('*, catalog_items(id, description, category, brand, model, unit, ref_price, last_quote_price)')
    .eq('estimate_version_id', vid)
    .order('created_at')

  const safeLines = lines ?? []

  if (type === 'bom') {
    const bomLines = safeLines.map((l: Record<string, unknown>) => {
      const ci = l.catalog_items as Record<string, unknown> | null
      const unitPrice = (ci?.last_quote_price ?? ci?.ref_price ?? null) as number | null
      return {
        description: (l.description ?? ci?.description ?? '') as string,
        category: (ci?.category ?? 'other') as string,
        brand: ci?.brand as string | null,
        model: ci?.model as string | null,
        qty: l.quantity as number,
        unit: (ci?.unit ?? 'ea') as string,
        unit_price: unitPrice,
        total_material: (l.quantity as number) * (l.unit_material_cost as number),
        labor_hours: (l.quantity as number) * (l.unit_labor_hours as number),
        source: l.source as string,
      }
    })
    const buffer = generateBomXlsx(bomLines, { projectName: project.name, versionLabel, date })
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="bom_${fileSlug}.xlsx"`,
      },
    })
  }

  if (type === 'rfq') {
    const rfqLines = safeLines
      .filter((l: Record<string, unknown>) => l.catalog_item_id != null)
      .map((l: Record<string, unknown>) => {
        const ci = l.catalog_items as Record<string, unknown> | null
        return {
          description: (l.description ?? ci?.description ?? '') as string,
          category: (ci?.category ?? 'other') as string,
          qty: l.quantity as number,
          unit: (ci?.unit ?? 'ea') as string,
        }
      })
    const buffer = generateRfqXlsx(rfqLines, {
      projectName: project.name,
      vendorName: 'Proveedor',
      date,
    })
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="rfq_${fileSlug}.xlsx"`,
      },
    })
  }

  if (type === 'cost_sheet') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rules } = await (supabase.from('pricing_rules') as any)
      .select('*').eq('project_id', projectId).single()
    const r = rules ?? { overhead_pct: 10, contingency_pct: 5, markup_pct: 20, tax_pct: 0, labor_rate_per_hr: 65 }

    const costLines = safeLines.map((l: Record<string, unknown>) => {
      const ci = l.catalog_items as Record<string, unknown> | null
      return {
        description: (l.description ?? ci?.description ?? '') as string,
        category: (ci?.category ?? 'other') as string,
        qty: l.quantity as number,
        unit: (ci?.unit ?? 'ea') as string,
        unit_price: l.unit_material_cost as number,
        total_material: (l.quantity as number) * (l.unit_material_cost as number),
        unit_labor_hours: l.unit_labor_hours as number,
        total_labor_hours: (l.quantity as number) * (l.unit_labor_hours as number),
      }
    })
    const buffer = generateCostSheetXlsx(costLines, r, { projectName: project.name, versionLabel, date })
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="costsheet_${fileSlug}.xlsx"`,
      },
    })
  }

  if (type === 'proposal') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [{ data: rules }, { data: scopes }] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('pricing_rules') as any).select('*').eq('project_id', projectId).single(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('system_scopes') as any).select('discipline, form_data').eq('project_id', projectId),
    ])

    const r = rules ?? { overhead_pct: 10, contingency_pct: 5, markup_pct: 20, tax_pct: 0, labor_rate_per_hr: 65 }
    const totalMaterial = safeLines.reduce((a: number, l: Record<string, unknown>) => a + (l.quantity as number) * (l.unit_material_cost as number), 0)
    const totalHours = safeLines.reduce((a: number, l: Record<string, unknown>) => a + (l.quantity as number) * (l.unit_labor_hours as number), 0)
    const totalLabor = totalHours * r.labor_rate_per_hr
    const subtotal = totalMaterial + totalLabor
    const consumables = subtotal * 0.03
    const overhead = subtotal * (r.overhead_pct / 100)
    const contingency = (subtotal + overhead) * (r.contingency_pct / 100)
    const totalCost = subtotal + consumables + overhead + contingency
    const markup = totalCost * (r.markup_pct / 100)
    const netPrice = totalCost + markup
    const tax = netPrice * (r.tax_pct / 100)
    const finalPrice = netPrice + tax

    const DISCIPLINE_SUMMARIES: Record<string, string> = {
      cctv: 'Sistema de videovigilancia IP con cámaras, grabación y monitoreo centralizado.',
      acs: 'Sistema de control de acceso con lectores, cerraduras electrónicas y gestión de credenciales.',
      intrusion: 'Sistema de detección de intrusión con sensores perimetrales e interiores, panel y comunicación.',
      fire_alarm: 'Sistema de alarma contra incendio addressable con detectores, dispositivos NAC y panel central.',
    }

    const scopeSummaries = (scopes ?? []).map((s: { discipline: string; form_data: Record<string, unknown> }) => ({
      discipline: s.discipline,
      summary: DISCIPLINE_SUMMARIES[s.discipline] ?? `Sistema ${s.discipline}.`,
    }))

    const proposalLines = safeLines
      .filter((l: Record<string, unknown>) => l.catalog_item_id != null)
      .map((l: Record<string, unknown>) => {
        const ci = l.catalog_items as Record<string, unknown> | null
        return {
          description: (l.description ?? ci?.description ?? '') as string,
          category: (ci?.category ?? 'other') as string,
          qty: l.quantity as number,
          unit: (ci?.unit ?? 'ea') as string,
        }
      })

    const buffer = generateProposalPdf(proposalLines, scopeSummaries, finalPrice, {
      projectName: project.name,
      clientName: project.client ?? 'Cliente',
      versionLabel,
      date,
      location: project.location ?? undefined,
    })

    // Registrar en export_jobs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('export_jobs') as any).insert({
      project_id: projectId,
      estimate_version_id: vid,
      export_type: type,
      file_path: `proposal_${fileSlug}.pdf`,
    })

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposal_${fileSlug}.pdf"`,
      },
    })
  }

  return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
}
