'use client'

import { useState, useRef, useTransition, DragEvent } from 'react'
import { uploadPlanFile } from './actions'
import { ARCHITECTURAL_SCALE_OPTIONS, SCALE_UNIT_OPTIONS } from '@/lib/scale'

interface UploadFormProps {
  projectId: string
  onSuccess?: () => void
}

export default function UploadForm({ projectId, onSuccess }: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [scaleType, setScaleType] = useState<'architectural' | 'ratio' | 'manual'>('architectural')
  const [archScale, setArchScale] = useState('1/4')
  const [ratioNum, setRatioNum] = useState('1')
  const [ratioDen, setRatioDen] = useState('100')
  const [manualFactor, setManualFactor] = useState('48')
  const [scaleUnit, setScaleUnit] = useState<'in' | 'ft' | 'mm' | 'm'>('in')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

  function validateAndSetFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['dxf', 'pdf'].includes(ext ?? '')) {
      setError('Solo se permiten archivos .dxf o .pdf')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('El archivo supera el límite de 50MB')
      return
    }
    setError(null)
    setSelectedFile(file)
  }

  function getScaleValue(): string {
    if (scaleType === 'architectural') return archScale
    if (scaleType === 'ratio') return `${ratioNum}:${ratioDen}`
    return manualFactor
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) { setError('Selecciona un archivo'); return }

    const fd = new FormData(formRef.current!)
    fd.set('project_id', projectId)
    fd.set('file', selectedFile)
    fd.set('scale_type', scaleType)
    fd.set('scale_value', getScaleValue())
    fd.set('scale_unit', scaleUnit)

    setError(null)
    startTransition(async () => {
      const result = await uploadPlanFile(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        setSelectedFile(null)
        formRef.current?.reset()
        onSuccess?.()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-950/30' : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".dxf,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        {selectedFile ? (
          <div>
            <p className="text-green-400 font-medium">{selectedFile.name}</p>
            <p className="text-gray-500 text-sm mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-400">Arrastra un archivo aquí o haz clic para seleccionar</p>
            <p className="text-gray-600 text-sm mt-1">.dxf · .pdf · máximo 50MB</p>
          </div>
        )}
      </div>

      {/* File metadata */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Etiqueta del archivo</label>
          <input
            name="file_label"
            type="text"
            placeholder="Ej: Piso 2 — CCTV"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Número de piso</label>
          <input
            name="floor_number"
            type="number"
            min="1"
            defaultValue="1"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Scale configuration */}
      <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
        <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">Configuración de escala</p>

        {/* Scale type selector */}
        <div className="flex gap-4">
          {(['architectural', 'ratio', 'manual'] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scale_type_radio"
                checked={scaleType === t}
                onChange={() => setScaleType(t)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-300 capitalize">
                {t === 'architectural' ? 'Arquitectónica USA' : t === 'ratio' ? 'Ratio (1:N)' : 'Factor manual'}
              </span>
            </label>
          ))}
        </div>

        {/* Architectural scale dropdown */}
        {scaleType === 'architectural' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Escala arquitectónica</label>
            <select
              value={archScale}
              onChange={(e) => setArchScale(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {ARCHITECTURAL_SCALE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (factor {opt.factor})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Ratio scale inputs */}
        {scaleType === 'ratio' && (
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Numerador</label>
              <input
                type="number"
                min="1"
                value={ratioNum}
                onChange={(e) => setRatioNum(e.target.value)}
                className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-gray-500 mt-4">:</span>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Denominador</label>
              <input
                type="number"
                min="1"
                value={ratioDen}
                onChange={(e) => setRatioDen(e.target.value)}
                className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Unidad del plano</label>
              <select
                value={scaleUnit}
                onChange={(e) => setScaleUnit(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {SCALE_UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Manual factor input */}
        {scaleType === 'manual' && (
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Factor de escala</label>
              <input
                type="number"
                min="0.001"
                step="any"
                value={manualFactor}
                onChange={(e) => setManualFactor(e.target.value)}
                className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Unidad del plano</label>
              <select
                value={scaleUnit}
                onChange={(e) => setScaleUnit(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {SCALE_UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 pb-2">1 unidad en plano = {manualFactor} ft real</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || !selectedFile}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {isPending ? 'Subiendo...' : 'Subir archivo'}
      </button>
    </form>
  )
}
