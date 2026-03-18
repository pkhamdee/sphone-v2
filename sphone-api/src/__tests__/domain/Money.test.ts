import { describe, it, expect } from 'vitest'
import { Money } from '../../domain/products/Money'

describe('Money', () => {
  it('creates with default THB currency', () => {
    const m = Money.create(1000)
    expect(m.amount).toBe(1000)
    expect(m.currency).toBe('THB')
  })

  it('creates with explicit currency', () => {
    const m = Money.create(50, 'USD')
    expect(m.currency).toBe('USD')
  })

  it('allows zero amount', () => {
    expect(() => Money.create(0)).not.toThrow()
  })

  it('throws for negative amount', () => {
    expect(() => Money.create(-1)).toThrow('Amount cannot be negative')
  })

  it('adds two money values', () => {
    const a = Money.create(1000)
    const b = Money.create(500)
    expect(a.add(b).amount).toBe(1500)
  })

  it('multiplies by a factor', () => {
    const m = Money.create(1000)
    expect(m.multiply(1.5).amount).toBe(1500)
  })

  it('multiply rounds to 2 decimal places', () => {
    const m = Money.create(1000)
    expect(m.multiply(0.333).amount).toBe(333)
  })

  it('two equal money values are equal', () => {
    expect(Money.create(1000).equals(Money.create(1000))).toBe(true)
  })

  it('different amounts are not equal', () => {
    expect(Money.create(1000).equals(Money.create(999))).toBe(false)
  })

  it('same amount different currency are not equal', () => {
    expect(Money.create(100, 'THB').equals(Money.create(100, 'USD'))).toBe(false)
  })
})
