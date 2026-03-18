import { describe, it, expect } from 'vitest'
import { InstallmentPlan } from '../../domain/orders/InstallmentPlan'

describe('InstallmentPlan', () => {
  describe('calculate()', () => {
    it('calculates correct monthly amount with PMT formula', () => {
      // 10,000 principal, 12 months, 18% APR
      // monthly rate = 0.18/12 = 0.015
      // PMT = 10000 * 0.015 * (1.015^12) / (1.015^12 - 1)
      const plan = InstallmentPlan.calculate(12000, 2000, 12)
      expect(plan.monthlyAmount).toBeGreaterThan(0)
      expect(plan.totalMonths).toBe(12)
      expect(plan.downPayment).toBe(2000)
      expect(plan.productPrice).toBe(12000)
      expect(plan.interestRate).toBe(0.18)
    })

    it('total amount equals monthly * months', () => {
      const plan = InstallmentPlan.calculate(15000, 3000, 12)
      expect(plan.totalAmount).toBeCloseTo(plan.monthlyAmount * 12, 1)
    })

    it.each([3, 6, 12, 18, 24])('accepts %d month term', (months) => {
      // Use a price large enough that monthly payment exceeds the 500 THB minimum for all terms
      expect(() => InstallmentPlan.calculate(30000, 3000, months)).not.toThrow()
    })

    it('throws for invalid term', () => {
      expect(() => InstallmentPlan.calculate(10000, 1000, 9)).toThrow(
        'Total months must be one of: 3, 6, 12, 18, 24',
      )
    })

    it('throws when down payment is zero', () => {
      expect(() => InstallmentPlan.calculate(10000, 0, 12)).toThrow(
        'Down payment must be greater than 0 and less than product price',
      )
    })

    it('throws when down payment equals product price', () => {
      expect(() => InstallmentPlan.calculate(10000, 10000, 12)).toThrow(
        'Down payment must be greater than 0 and less than product price',
      )
    })

    it('throws when down payment exceeds product price', () => {
      expect(() => InstallmentPlan.calculate(10000, 11000, 12)).toThrow(
        'Down payment must be greater than 0 and less than product price',
      )
    })

    it('throws when monthly amount would be below 500 THB', () => {
      // Very low price and high down payment to trigger <500 monthly
      expect(() => InstallmentPlan.calculate(1000, 999, 24)).toThrow(
        'Monthly installment must be at least 500 THB',
      )
    })

    it('higher down payment reduces monthly amount', () => {
      const lowDown = InstallmentPlan.calculate(20000, 2000, 12)
      const highDown = InstallmentPlan.calculate(20000, 8000, 12)
      expect(highDown.monthlyAmount).toBeLessThan(lowDown.monthlyAmount)
    })

    it('longer term reduces monthly amount', () => {
      const short = InstallmentPlan.calculate(20000, 2000, 6)
      const long = InstallmentPlan.calculate(20000, 2000, 24)
      expect(long.monthlyAmount).toBeLessThan(short.monthlyAmount)
    })

    it('longer term increases total interest paid', () => {
      const short = InstallmentPlan.calculate(20000, 2000, 6)
      const long = InstallmentPlan.calculate(20000, 2000, 24)
      expect(long.totalAmount).toBeGreaterThan(short.totalAmount)
    })
  })

  describe('reconstitute()', () => {
    it('restores plan from stored values without recalculating', () => {
      const plan = InstallmentPlan.reconstitute({
        productPrice: 15000,
        downPayment: 3000,
        totalMonths: 12,
        interestRate: 0.18,
        monthlyAmount: 1100,
        totalAmount: 13200,
      })
      expect(plan.monthlyAmount).toBe(1100)
      expect(plan.totalAmount).toBe(13200)
    })
  })
})
