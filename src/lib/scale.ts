// Scale factor helper for plan reader
// Returns: how many real feet correspond to 1 unit in the drawing

type ScaleType = 'architectural' | 'ratio' | 'manual'
type ScaleUnit = 'in' | 'ft' | 'mm' | 'm'

// Conversion from each unit to feet
const unitToFt: Record<ScaleUnit, number> = {
  in: 1 / 12,
  ft: 1,
  mm: 0.00328084,
  m: 3.28084,
}

// Architectural USA scales: key = fraction string, value = scale factor (how many ft per 1 inch on paper)
// e.g. 1/8" = 1'-0" means 1 inch on paper = 8 feet real → factor 96 (in drawing units are inches)
const ARCHITECTURAL_SCALES: Record<string, number> = {
  '1/8':  96,   // 1/8" = 1'-0"  → 1 in drawing = 96 in real → ÷12 = 8 ft per drawing inch
  '1/4':  48,   // 1/4" = 1'-0"
  '3/8':  32,   // 3/8" = 1'-0"
  '1/2':  24,   // 1/2" = 1'-0"
  '3/4':  16,   // 3/4" = 1'-0"
  '1':    12,   // 1"   = 1'-0"
  '1=10': 120,  // 1"   = 10'-0"
  '1=20': 240,  // 1"   = 20'-0"
}

/**
 * Calculate the scale factor: real_ft = drawing_units × scale_factor
 *
 * @param type  'architectural' | 'ratio' | 'manual'
 * @param value For architectural: fraction string like '1/8' or '1=10'
 *              For ratio: string like '1:100' or number denominator
 *              For manual: numeric factor
 * @param unit  Unit of measurement in the drawing (used for ratio type)
 * @returns     Number of real feet per 1 drawing unit
 */
export function calculateScaleFactor(
  type: ScaleType,
  value: string | number,
  unit: ScaleUnit = 'ft'
): number {
  switch (type) {
    case 'architectural': {
      const key = String(value)
      const factor = ARCHITECTURAL_SCALES[key]
      if (factor === undefined) {
        throw new Error(`Unknown architectural scale: ${key}`)
      }
      // Factor is already in inches-paper → feet-real, already includes ft conversion
      // The drawing units are assumed to be inches for architectural
      return factor
    }

    case 'ratio': {
      // value can be '1:100' or just the denominator as number
      let denominator: number
      if (typeof value === 'string' && value.includes(':')) {
        const parts = value.split(':')
        denominator = parseFloat(parts[1])
      } else {
        denominator = parseFloat(String(value))
      }
      // 1 drawing unit = denominator real units (in `unit`)
      // Convert to feet
      return denominator * unitToFt[unit]
    }

    case 'manual': {
      return parseFloat(String(value))
    }

    default:
      throw new Error(`Unknown scale type: ${type}`)
  }
}

/**
 * Get the list of architectural scale options for UI dropdowns
 */
export const ARCHITECTURAL_SCALE_OPTIONS = [
  { label: '1/8"=1\'-0"', value: '1/8', factor: 96 },
  { label: '1/4"=1\'-0"', value: '1/4', factor: 48 },
  { label: '3/8"=1\'-0"', value: '3/8', factor: 32 },
  { label: '1/2"=1\'-0"', value: '1/2', factor: 24 },
  { label: '3/4"=1\'-0"', value: '3/4', factor: 16 },
  { label: '1"=1\'-0"',   value: '1',   factor: 12 },
  { label: '1"=10\'-0"',  value: '1=10', factor: 120 },
  { label: '1"=20\'-0"',  value: '1=20', factor: 240 },
]

export const SCALE_UNIT_OPTIONS: { label: string; value: ScaleUnit }[] = [
  { label: 'Inches (in)', value: 'in' },
  { label: 'Feet (ft)',   value: 'ft' },
  { label: 'Millimeters (mm)', value: 'mm' },
  { label: 'Meters (m)', value: 'm' },
]
