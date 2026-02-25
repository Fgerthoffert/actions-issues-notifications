/**
 * Unit tests for the formatDate utility function
 */
import { formatDate } from '../src/utils/formatters/formatDate.js'

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    // Use a fixed date to avoid timezone issues in tests
    const isoDate = '2026-02-25T10:30:00Z'
    const result = formatDate(isoDate)

    // The result should contain the expected date components
    expect(result).toContain('Feb')
    expect(result).toContain('25')
    expect(result).toContain('2026')
  })

  it('formats a date with time components', () => {
    const isoDate = '2026-12-15T14:45:00Z'
    const result = formatDate(isoDate)

    expect(result).toContain('Dec')
    expect(result).toContain('15')
    expect(result).toContain('2026')
  })

  it('returns original string for invalid date', () => {
    const invalidDate = 'not-a-date'
    const result = formatDate(invalidDate)

    expect(result).toBe('not-a-date')
  })

  it('returns original string for empty string', () => {
    const result = formatDate('')

    expect(result).toBe('')
  })

  it('returns original string for N/A', () => {
    const result = formatDate('N/A')

    expect(result).toBe('N/A')
  })

  it('handles date-only string', () => {
    const dateOnly = '2026-06-01'
    const result = formatDate(dateOnly)

    expect(result).toContain('Jun')
    expect(result).toContain('1')
    expect(result).toContain('2026')
  })
})
