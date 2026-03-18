import { describe, it, expect } from 'vitest'
import { NationalId } from '../../domain/customers/NationalId'

describe('NationalId', () => {
  it('creates a valid 13-digit national ID', () => {
    const id = NationalId.create('1234567890123')
    expect(id.value).toBe('1234567890123')
  })

  it('throws for fewer than 13 digits', () => {
    expect(() => NationalId.create('123456789012')).toThrow('National ID must be exactly 13 digits')
  })

  it('throws for more than 13 digits', () => {
    expect(() => NationalId.create('12345678901234')).toThrow('National ID must be exactly 13 digits')
  })

  it('throws for non-digit characters', () => {
    expect(() => NationalId.create('123456789012a')).toThrow('National ID must be exactly 13 digits')
  })

  it('throws for empty string', () => {
    expect(() => NationalId.create('')).toThrow('National ID must be exactly 13 digits')
  })

  it('two IDs with same value are equal', () => {
    const a = NationalId.create('1234567890123')
    const b = NationalId.create('1234567890123')
    expect(a.equals(b)).toBe(true)
  })

  it('two IDs with different values are not equal', () => {
    const a = NationalId.create('1234567890123')
    const b = NationalId.create('9876543210987')
    expect(a.equals(b)).toBe(false)
  })
})
