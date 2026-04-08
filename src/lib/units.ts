/**
 * Unit conversion helpers for ScopeCalc LV.
 * All values are stored internally in feet (ft).
 * Conversion to meters is done only for display purposes.
 */

export function convertLength(value: number, from: 'ft' | 'm', to: 'ft' | 'm'): number {
  if (from === to) return value
  if (from === 'ft' && to === 'm') return value * 0.3048
  return value * 3.28084 // m to ft
}

export function formatLength(value: number, unit: 'ft' | 'm'): string {
  const rounded = Math.round(value * 10) / 10
  return `${rounded} ${unit}`
}
