import { describe, it, expect } from 'vitest'
import { PhoneNumber } from '../../domain/customers/PhoneNumber'

describe('PhoneNumber', () => {
  it.each([
    '0812345678',
    '0912345678',
    '0612345678',
  ])('accepts valid Thai mobile number %s', (phone) => {
    expect(() => PhoneNumber.create(phone)).not.toThrow()
    expect(PhoneNumber.create(phone).value).toBe(phone)
  })

  it.each([
    ['0712345678', 'invalid prefix 07'],
    ['1812345678', 'does not start with 0'],
    ['081234567', 'too short'],
    ['08123456789', 'too long'],
    ['081234567a', 'non-digit'],
    ['', 'empty string'],
  ])('rejects "%s" (%s)', (phone) => {
    expect(() => PhoneNumber.create(phone)).toThrow(
      'Phone number must be a valid Thai mobile number (0[689]xxxxxxxx)',
    )
  })

  it('two numbers with same value are equal', () => {
    const a = PhoneNumber.create('0812345678')
    const b = PhoneNumber.create('0812345678')
    expect(a.equals(b)).toBe(true)
  })

  it('two numbers with different values are not equal', () => {
    const a = PhoneNumber.create('0812345678')
    const b = PhoneNumber.create('0987654321')
    expect(a.equals(b)).toBe(false)
  })
})
