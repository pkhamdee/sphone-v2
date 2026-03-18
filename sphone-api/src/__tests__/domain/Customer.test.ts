import { describe, it, expect } from 'vitest'
import { Customer } from '../../domain/customers/Customer'
import { CustomerStatus } from '../../domain/customers/CustomerStatus'

const validParams = {
  id: '00000000-0000-0000-0000-000000000001',
  nationalId: '1234567890123',
  fullName: 'Somchai Jaidee',
  phoneNumber: '0812345678',
  dateOfBirth: new Date('1990-01-01'),
}

describe('Customer', () => {
  describe('create()', () => {
    it('creates a customer with default credit limit 100000 and Pending status', () => {
      const customer = Customer.create(validParams)
      expect(customer.fullName).toBe('Somchai Jaidee')
      expect(customer.creditLimit).toBe(100000)
      expect(customer.status).toBe(CustomerStatus.Pending)
      expect(customer.nationalId.value).toBe('1234567890123')
      expect(customer.phoneNumber.value).toBe('0812345678')
    })

    it('emits a CustomerRegisteredEvent', () => {
      const customer = Customer.create(validParams)
      const events = customer.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0].constructor.name).toBe('CustomerRegisteredEvent')
    })

    it('throws when national ID is invalid', () => {
      expect(() => Customer.create({ ...validParams, nationalId: '123' })).toThrow(
        'National ID must be exactly 13 digits',
      )
    })

    it('throws when phone number is invalid', () => {
      expect(() => Customer.create({ ...validParams, phoneNumber: '0712345678' })).toThrow(
        'Phone number must be a valid Thai mobile number',
      )
    })
  })

  describe('canPlaceOrder()', () => {
    it('returns true for Pending status', () => {
      const customer = Customer.create(validParams)
      expect(customer.canPlaceOrder()).toBe(true)
    })

    it('returns true for Verified status', () => {
      const customer = Customer.reconstitute({ ...validParams, creditLimit: 50000, status: CustomerStatus.Verified, createdAt: new Date() })
      expect(customer.canPlaceOrder()).toBe(true)
    })

    it('returns false for Suspended status', () => {
      const customer = Customer.reconstitute({ ...validParams, creditLimit: 30000, status: CustomerStatus.Suspended, createdAt: new Date() })
      expect(customer.canPlaceOrder()).toBe(false)
    })
  })

  describe('reconstitute()', () => {
    it('restores customer without emitting events', () => {
      const customer = Customer.reconstitute({
        ...validParams,
        creditLimit: 50000,
        status: CustomerStatus.Verified,
        createdAt: new Date('2025-01-01'),
      })
      expect(customer.creditLimit).toBe(50000)
      expect(customer.status).toBe(CustomerStatus.Verified)
      expect(customer.getDomainEvents()).toHaveLength(0)
    })
  })
})
