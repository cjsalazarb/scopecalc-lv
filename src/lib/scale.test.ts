import { calculateScaleFactor } from './scale'

describe('calculateScaleFactor', () => {
  // Architectural USA scales
  describe('architectural', () => {
    test('1/8" = 1\'-0" → factor 96', () => {
      expect(calculateScaleFactor('architectural', '1/8', 'in')).toBe(96)
    })

    test('1/4" = 1\'-0" → factor 48', () => {
      expect(calculateScaleFactor('architectural', '1/4', 'in')).toBe(48)
    })

    test('3/8" = 1\'-0" → factor 32', () => {
      expect(calculateScaleFactor('architectural', '3/8', 'in')).toBe(32)
    })

    test('1/2" = 1\'-0" → factor 24', () => {
      expect(calculateScaleFactor('architectural', '1/2', 'in')).toBe(24)
    })

    test('3/4" = 1\'-0" → factor 16', () => {
      expect(calculateScaleFactor('architectural', '3/4', 'in')).toBe(16)
    })

    test('1" = 1\'-0" → factor 12', () => {
      expect(calculateScaleFactor('architectural', '1', 'in')).toBe(12)
    })

    test('1" = 10\'-0" → factor 120', () => {
      expect(calculateScaleFactor('architectural', '1=10', 'in')).toBe(120)
    })

    test('1" = 20\'-0" → factor 240', () => {
      expect(calculateScaleFactor('architectural', '1=20', 'in')).toBe(240)
    })

    test('unknown scale throws', () => {
      expect(() => calculateScaleFactor('architectural', '1/16', 'in')).toThrow()
    })
  })

  // Ratio scales
  describe('ratio', () => {
    test('1:100 in mm → 100 × 0.00328084 ≈ 0.328084', () => {
      const result = calculateScaleFactor('ratio', '1:100', 'mm')
      expect(result).toBeCloseTo(0.328084, 5)
    })

    test('1:48 in inches → 48 × (1/12) = 4 ft per drawing inch', () => {
      const result = calculateScaleFactor('ratio', '1:48', 'in')
      expect(result).toBeCloseTo(4, 5)
    })

    test('1:1 in feet → 1 ft per drawing ft', () => {
      const result = calculateScaleFactor('ratio', '1:1', 'ft')
      expect(result).toBe(1)
    })

    test('denominator as number → works the same', () => {
      const result = calculateScaleFactor('ratio', 100, 'mm')
      expect(result).toBeCloseTo(0.328084, 5)
    })

    test('1:1 in meters → 3.28084 ft per drawing meter', () => {
      const result = calculateScaleFactor('ratio', '1:1', 'm')
      expect(result).toBeCloseTo(3.28084, 5)
    })
  })

  // Manual scales
  describe('manual', () => {
    test('manual factor 48 → 48', () => {
      expect(calculateScaleFactor('manual', 48, 'ft')).toBe(48)
    })

    test('manual factor as string → parsed correctly', () => {
      expect(calculateScaleFactor('manual', '96', 'ft')).toBe(96)
    })

    test('manual factor 1 → 1', () => {
      expect(calculateScaleFactor('manual', 1, 'ft')).toBe(1)
    })
  })
})
