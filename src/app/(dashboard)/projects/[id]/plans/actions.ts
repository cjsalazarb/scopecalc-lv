'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateScaleFactor } from '@/lib/scale'

export async function uploadPlanFile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const projectId = formData.get('project_id') as string
  const file = formData.get('file') as File
  const fileLabel = (formData.get('file_label') as string) || file.name
  const floorNumber = parseInt(formData.get('floor_number') as string) || 1
  const scaleType = formData.get('scale_type') as 'architectural' | 'ratio' | 'manual'
  const scaleValue = formData.get('scale_value') as string
  const scaleUnit = (formData.get('scale_unit') as 'in' | 'ft' | 'mm' | 'm') || 'ft'

  if (!file || !projectId) return { error: 'Faltan datos requeridos' }

  // Validate file type
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['dxf', 'pdf'].includes(ext ?? '')) {
    return { error: 'Solo se permiten archivos DXF o PDF' }
  }

  // Validate file size (50MB)
  if (file.size > 50 * 1024 * 1024) {
    return { error: 'El archivo supera el límite de 50MB' }
  }

  // Calculate scale factor
  let scaleFactor: number
  let scaleArch: string | null = null
  let scaleRatio: number | null = null

  try {
    if (scaleType === 'architectural') {
      scaleFactor = calculateScaleFactor('architectural', scaleValue, 'in')
      scaleArch = scaleValue
    } else if (scaleType === 'ratio') {
      scaleFactor = calculateScaleFactor('ratio', scaleValue, scaleUnit)
      const parts = scaleValue.split(':')
      scaleRatio = parseFloat(parts[1] ?? scaleValue)
    } else {
      scaleFactor = calculateScaleFactor('manual', parseFloat(scaleValue), scaleUnit)
    }
  } catch {
    return { error: 'Configuración de escala inválida' }
  }

  // Upload to Supabase Storage
  const storagePath = `${projectId}/${Date.now()}_${file.name}`
  const arrayBuffer = await file.arrayBuffer()
  const uint8 = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await (supabase.storage as any)
    .from('plans')
    .upload(storagePath, uint8, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    return { error: `Error al subir archivo: ${uploadError.message}` }
  }

  // Create record in project_files
  const { error: dbError } = await (supabase.from('project_files') as any).insert({
    project_id: projectId,
    floor_number: floorNumber,
    file_label: fileLabel,
    file_type: ext as 'dxf' | 'pdf',
    storage_path: storagePath,
    scale_type: scaleType,
    scale_ratio: scaleRatio,
    scale_arch: scaleArch,
    scale_factor: scaleFactor,
    scale_unit: scaleUnit,
  })

  if (dbError) {
    // Clean up uploaded file
    await (supabase.storage as any).from('plans').remove([storagePath])
    return { error: `Error al guardar registro: ${dbError.message}` }
  }

  revalidatePath(`/projects/${projectId}/plans`)
  return { success: true }
}

export async function deletePlanFile(fileId: string, storagePath: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Delete from storage
  await (supabase.storage as any).from('plans').remove([storagePath])

  // Delete DB record
  const { error } = await (supabase.from('project_files') as any)
    .delete()
    .eq('id', fileId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}/plans`)
  return { success: true }
}
