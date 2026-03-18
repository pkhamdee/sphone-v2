import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterCustomerCommand } from '../../application/customers/commands/RegisterCustomerCommand'
import type { ICustomerRepository } from '../../domain/customers/ICustomerRepository'
import type { IEventBus } from '../../application/ports/IEventBus'

// Mock the OTel metrics module to avoid initializing the SDK in tests
vi.mock('../../infrastructure/observability/metrics', () => ({
  customersRegisteredCounter: { add: vi.fn() },
  ordersCreatedCounter: { add: vi.fn() },
  orderInstallmentAmountHistogram: { record: vi.fn() },
}))

const validInput = {
  nationalId: '1234567890123',
  fullName: 'Somchai Jaidee',
  phoneNumber: '0812345678',
  dateOfBirth: '1990-06-15',
}

function makeRepo(overrides: Partial<ICustomerRepository> = {}): ICustomerRepository {
  return {
    findById: vi.fn(),
    findByNationalId: vi.fn(),
    existsByNationalId: vi.fn().mockResolvedValue(false),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function makeEventBus(): IEventBus {
  return { publish: vi.fn().mockResolvedValue(undefined) }
}

describe('RegisterCustomerCommand', () => {
  let repo: ICustomerRepository
  let eventBus: IEventBus
  let command: RegisterCustomerCommand

  beforeEach(() => {
    repo = makeRepo()
    eventBus = makeEventBus()
    command = new RegisterCustomerCommand(repo, eventBus)
  })

  it('registers a new customer and returns id + fullName', async () => {
    const result = await command.execute(validInput)
    expect(result.fullName).toBe('Somchai Jaidee')
    expect(result.customerId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('saves the customer to the repository', async () => {
    await command.execute(validInput)
    expect(repo.save).toHaveBeenCalledOnce()
  })

  it('publishes a domain event after registration', async () => {
    await command.execute(validInput)
    expect(eventBus.publish).toHaveBeenCalledOnce()
  })

  it('throws when national ID already exists', async () => {
    repo = makeRepo({ existsByNationalId: vi.fn().mockResolvedValue(true) })
    command = new RegisterCustomerCommand(repo, eventBus)
    await expect(command.execute(validInput)).rejects.toThrow(
      'Customer with this national ID already exists',
    )
  })

  it('does not save when national ID already exists', async () => {
    repo = makeRepo({ existsByNationalId: vi.fn().mockResolvedValue(true) })
    command = new RegisterCustomerCommand(repo, eventBus)
    await expect(command.execute(validInput)).rejects.toThrow()
    expect(repo.save).not.toHaveBeenCalled()
  })

  it('throws for invalid national ID format', async () => {
    await expect(command.execute({ ...validInput, nationalId: 'abc' })).rejects.toThrow(
      'National ID must be exactly 13 digits',
    )
  })

  it('throws for invalid phone number format', async () => {
    await expect(command.execute({ ...validInput, phoneNumber: '0712345678' })).rejects.toThrow(
      'Phone number must be a valid Thai mobile number',
    )
  })
})
