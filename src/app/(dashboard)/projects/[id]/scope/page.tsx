import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CctvForm } from './cctv-form'
import { AcsForm } from './acs-form'
import { IntrusionForm } from './intrusion-form'
import { FireAlarmForm } from './fire-alarm-form'

const DISCIPLINE_LABELS: Record<string, string> = {
  cctv: 'CCTV',
  acs: 'ACS',
  intrusion: 'Intrusion',
  fire_alarm: 'Fire Alarm',
}

function isComplete(discipline: string, formData: Record<string, unknown>): boolean {
  if (discipline === 'cctv') return Number(formData.qty_cameras ?? 0) > 0
  if (discipline === 'acs') return Number(formData.qty_doors ?? 0) > 0
  if (discipline === 'intrusion') return Number(formData.qty_sensors ?? 0) > 0
  if (discipline === 'fire_alarm') return Number(formData.qty_detectors_smoke ?? 0) + Number(formData.qty_detectors_heat ?? 0) + Number(formData.qty_detectors_combo ?? 0) > 0
  return false
}

export default async function ScopePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const supabase = await createClient()

  const [{ data: project }, { data: scopes }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('projects') as any).select('name, disciplines').eq('id', id).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('system_scopes') as any).select('discipline, form_data').eq('project_id', id),
  ])

  if (!project) notFound()

  const disciplines: string[] = project.disciplines ?? []
  const activeTab = tab ?? disciplines[0] ?? 'cctv'
  const scopeMap = Object.fromEntries((scopes ?? []).map((s: { discipline: string; form_data: Record<string, unknown> }) => [s.discipline, s.form_data]))

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/projects/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">← {project.name}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-300 text-sm font-medium">Scope</span>
      </div>

      {/* Discipline tabs */}
      <div className="flex gap-2 mb-6">
        {disciplines.map((d: string) => {
          const complete = isComplete(d, scopeMap[d] ?? {})
          return (
            <Link
              key={d}
              href={`/projects/${id}/scope?tab=${d}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                activeTab === d
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              {DISCIPLINE_LABELS[d]}
              <span className={`w-2 h-2 rounded-full ${complete ? 'bg-green-400' : 'bg-gray-600'}`} />
            </Link>
          )
        })}
      </div>

      {/* Form */}
      {activeTab === 'cctv' && disciplines.includes('cctv') && (
        <CctvForm projectId={id} initialData={scopeMap['cctv'] ?? {}} />
      )}
      {activeTab === 'acs' && disciplines.includes('acs') && (
        <AcsForm projectId={id} initialData={scopeMap['acs'] ?? {}} />
      )}
      {activeTab === 'intrusion' && disciplines.includes('intrusion') && (
        <IntrusionForm projectId={id} initialData={scopeMap['intrusion'] ?? {}} />
      )}
      {activeTab === 'fire_alarm' && disciplines.includes('fire_alarm') && (
        <FireAlarmForm projectId={id} initialData={scopeMap['fire_alarm'] ?? {}} />
      )}
    </div>
  )
}
