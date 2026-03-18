import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateOrderCommand } from '../../application/orders/commands/CreateOrderCommand'
import { Customer } from '../../domain/customers/Customer'
import { Product } from '../../domain/products/Product'
import type { ICustomerRepository } from '../../domain/customers/ICustomerRepository'
import type { IProductRepository } from '../../domain/products/IProductRepository'
import type { IOrderRepository } from '../../domain/orders/IOrderRepository'
import type { IPaymentScheduleRepository } from '../../domain/payments/IPaymentScheduleRepository'
import type { IEventBus } from '../../application/ports/IEventBus'

vi.mock('../../infrastructure/observability/metrics', () => ({
  customersRegisteredCounter: { add: vi.fn() },
  ordersCreatedCounter: { add: vi.fn() },
  orderInstallmentAmountHistogram: { record: vi.fn() },
}))

const mockCustomer = Customer.reconstitute({
  id: '00000000-0000-0000-0000-000000000001',
  nationalId: '1234567890123',
  fullName: 'Somchai Jaidee',
  phoneNumber: '0812345678',
  dateOfBirth: new Date('1990-01-01'),
  creditLimit: 100000,
  status: 0,
  createdAt: new Date(),
})

const mockProduct = Product.reconstitute({
  id: '00000000-0000-0000-0000-000000000003',
  name: 'iPhone 15 Pro',
  description: 'Latest iPhone',
  brand: 'Apple',
  imageUrl: '/images/iphone.jpg',
  priceAmount: 45000,
  priceCurrency: 'THB',
  category: 1,
  isAvailable: true,
  createdAt: new Date(),
})

const validInput = {
  customerId: '00000000-0000-0000-0000-000000000001',
  productId: '00000000-0000-0000-0000-000000000003',
  downPayment: 5000,
  totalMonths: 12,
}

function makeRepos(overrides: {
  customerRepo?: Partial<ICustomerRepository>
  productRepo?: Partial<IProductRepository>
  orderRepo?: Partial<IOrderRepository>
  paymentRepo?: Partial<IPaymentScheduleRepository>
} = {}) {
  const customerRepo: ICustomerRepository = {
    findById: vi.fn().mockResolvedValue(mockCustomer),
    findByNationalId: vi.fn(),
    existsByNationalId: vi.fn(),
    save: vi.fn(),
    ...overrides.customerRepo,
  }
  const productRepo: IProductRepository = {
    findAll: vi.fn(),
    findByCategory: vi.fn(),
    findById: vi.fn().mockResolvedValue(mockProduct),
    ...overrides.productRepo,
  }
  const orderRepo: IOrderRepository = {
    findById: vi.fn(),
    findByCustomerId: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides.orderRepo,
  }
  const paymentScheduleRepo: IPaymentScheduleRepository = {
    findByOrderId: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides.paymentRepo,
  }
  const eventBus: IEventBus = { publish: vi.fn().mockResolvedValue(undefined) }
  return { customerRepo, productRepo, orderRepo, paymentScheduleRepo, eventBus }
}

describe('CreateOrderCommand', () => {
  let repos: ReturnType<typeof makeRepos>
  let command: CreateOrderCommand

  beforeEach(() => {
    repos = makeRepos()
    command = new CreateOrderCommand(
      repos.customerRepo,
      repos.productRepo,
      repos.orderRepo,
      repos.paymentScheduleRepo,
      repos.eventBus,
    )
  })

  it('creates an order and returns orderId with amounts', async () => {
    const result = await command.execute(validInput)
    expect(result.orderId).toMatch(/^[0-9a-f-]{36}$/)
    expect(result.monthlyAmount).toBeGreaterThan(0)
    expect(result.totalMonths).toBe(12)
    expect(result.totalAmount).toBeGreaterThan(0)
  })

  it('saves the order to the repository', async () => {
    await command.execute(validInput)
    expect(repos.orderRepo.save).toHaveBeenCalledOnce()
  })

  it('creates and saves a payment schedule', async () => {
    await command.execute(validInput)
    expect(repos.paymentScheduleRepo.save).toHaveBeenCalledOnce()
  })

  it('publishes a domain event', async () => {
    await command.execute(validInput)
    expect(repos.eventBus.publish).toHaveBeenCalledOnce()
  })

  it('throws when customer is not found', async () => {
    repos = makeRepos({ customerRepo: { findById: vi.fn().mockResolvedValue(null) } })
    command = new CreateOrderCommand(
      repos.customerRepo, repos.productRepo, repos.orderRepo,
      repos.paymentScheduleRepo, repos.eventBus,
    )
    await expect(command.execute(validInput)).rejects.toThrow('Customer not found')
  })

  it('throws when product is not found', async () => {
    repos = makeRepos({ productRepo: { findById: vi.fn().mockResolvedValue(null) } })
    command = new CreateOrderCommand(
      repos.customerRepo, repos.productRepo, repos.orderRepo,
      repos.paymentScheduleRepo, repos.eventBus,
    )
    await expect(command.execute(validInput)).rejects.toThrow('Product not found')
  })

  it('throws when product is not available', async () => {
    const unavailable = Product.reconstitute({ ...mockProduct['_id'] && {
      id: mockProduct.id.value,
      name: mockProduct.name, description: mockProduct.description, brand: mockProduct.brand,
      imageUrl: mockProduct.imageUrl, priceAmount: mockProduct.price.amount,
      priceCurrency: mockProduct.price.currency, category: mockProduct.category,
      isAvailable: false, createdAt: mockProduct.createdAt,
    }})
    repos = makeRepos({ productRepo: { findById: vi.fn().mockResolvedValue(unavailable) } })
    command = new CreateOrderCommand(
      repos.customerRepo, repos.productRepo, repos.orderRepo,
      repos.paymentScheduleRepo, repos.eventBus,
    )
    await expect(command.execute(validInput)).rejects.toThrow('Product is not available')
  })

  it('throws when total amount exceeds customer credit limit', async () => {
    const lowCreditCustomer = Customer.reconstitute({
      id: mockCustomer.id.value,
      nationalId: mockCustomer.nationalId.value,
      fullName: mockCustomer.fullName,
      phoneNumber: mockCustomer.phoneNumber.value,
      dateOfBirth: mockCustomer.dateOfBirth,
      creditLimit: 1000,
      status: 0,
      createdAt: new Date(),
    })
    repos = makeRepos({ customerRepo: { findById: vi.fn().mockResolvedValue(lowCreditCustomer) } })
    command = new CreateOrderCommand(
      repos.customerRepo, repos.productRepo, repos.orderRepo,
      repos.paymentScheduleRepo, repos.eventBus,
    )
    await expect(command.execute(validInput)).rejects.toThrow(/exceeds credit limit/)
  })
})
