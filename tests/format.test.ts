import { describe, expect, it } from 'vitest'
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  initials,
} from '@/lib/format'

describe('formatCurrency', () => {
  it('rounds large values by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235')
  })

  it('keeps cents with the precise option', () => {
    expect(formatCurrency(12.5, { precise: true })).toBe('$12.50')
  })
})

describe('formatNumber / formatCompact / formatPercent', () => {
  it('groups thousands', () => {
    expect(formatNumber(12345)).toBe('12,345')
  })

  it('compacts large numbers', () => {
    expect(formatCompact(1500)).toBe('1.5K')
    expect(formatCompact(2_000_000)).toBe('2M')
  })

  it('formats percentages with one decimal', () => {
    expect(formatPercent(3.456)).toBe('3.5%')
  })
})

describe('formatDate', () => {
  it('renders a short human date', () => {
    expect(formatDate(new Date('2026-03-09T12:00:00Z').toISOString())).toMatch(/Mar/)
  })
})

describe('initials', () => {
  it('uses the first letters of up to two words', () => {
    expect(initials('Ada Lovelace')).toBe('AL')
    expect(initials('Cher')).toBe('C')
  })
})
