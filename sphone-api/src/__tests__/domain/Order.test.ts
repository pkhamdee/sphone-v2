import { describe, it, expect } from 'vitest'
import { Order } from '../../domain/orders/Order'
import { OrderStatus } from '../../domain/orders/OrderStatus'

const baseParams = {
  id: '00000000-0000-0000-0000-000000000002',
  customerId: '00000000-0000-0000-0000-000000000001',
  productId: '00000000-0000-0000-0000-000000000003',
  productName: 'iPhone 15 Pro',
  productPrice: 45000,
  downPayment: 5000,
  totalMonths: 12,
  creditLimit: 100000,
}

describe('Order', () => {
  describe('create()', () => {
    it('creates an order and auto-approves it', () => {
      const order = Order.create(baseParams)
      expect(order.status).toBe(OrderStatus.Approved)
      expect(order.approvedAt).not.toBeNull()
    })

    it('sets the correct product and customer references', () => {
      const order = Order.create(baseParams)
      expect(order.productName).toBe('iPhone 15 Pro')
      expect(order.customerId).toBe(baseParams.customerId)
      expect(order.productId).toBe(baseParams.productId)
    })

    it('emits an OrderCreatedEvent', () => {
      const order = Order.create(baseParams)
      const events = order.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0].constructor.name).toBe('OrderCreatedEvent')
    })

    it('throws when total amount exceeds credit limit', () => {
      expect(() => Order.create({ ...baseParams, creditLimit: 1000 })).toThrow(
        /exceeds credit limit/,
      )
    })

    it('throws for invalid installment term', () => {
      expect(() => Order.create({ ...baseParams, totalMonths: 7 })).toThrow(
        'Total months must be one of: 3, 6, 12, 18, 24',
      )
    })

    it('throws when down payment is zero', () => {
      expect(() => Order.create({ ...baseParams, downPayment: 0 })).toThrow(
        'Down payment must be greater than 0 and less than product price',
      )
    })

    it('calculates a positive monthly amount', () => {
      const order = Order.create(baseParams)
      expect(order.installmentPlan.monthlyAmount).toBeGreaterThan(0)
    })
  })

  describe('reconstitute()', () => {
    it('restores an order without emitting events', () => {
      const order = Order.reconstitute({
        id: baseParams.id,
        customerId: baseParams.customerId,
        productId: baseParams.productId,
        productName: baseParams.productName,
        installmentProductPrice: 45000,
        installmentDownPayment: 5000,
        installmentTotalMonths: 12,
        installmentInterestRate: 0.18,
        installmentMonthlyAmount: 3500,
        installmentTotalAmount: 42000,
        status: OrderStatus.Approved,
        createdAt: new Date(),
        approvedAt: new Date(),
      })
      expect(order.status).toBe(OrderStatus.Approved)
      expect(order.getDomainEvents()).toHaveLength(0)
      expect(order.installmentPlan.monthlyAmount).toBe(3500)
    })
  })
})
