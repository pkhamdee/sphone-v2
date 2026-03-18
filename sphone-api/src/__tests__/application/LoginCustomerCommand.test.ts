import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginCustomerCommand } from '../../application/customers/commands/LoginCustomerCommand'
import { Customer } from '../../domain/customers/Customer'
import type { ICustomerRepository } from '../../domain/customers/ICustomerRepository'
import type { IJwtService } from '../../application/ports/IJwtService'

const existingCustomer = Customer.reconstitute({
  id: '00000000-0000-0000-0000-000000000001',
  nationalId: '1234567890123',
  fullName: 'Somchai Jaidee',
  phoneNumber: '0812345678',
  dateOfBirth: new Date('1990-01-01'),
  creditLimit: 100000,
  status: 0,
  createdAt: new Date(),
})

function makeRepo(overrides: Partial<ICustomerRepository> = {}): ICustomerRepository {
  return {
    findById: vi.fn(),
    findByNationalId: vi.fn().mockResolvedValue(existingCustomer),
    existsByNationalId: vi.fn(),
    save: vi.fn(),
    ...overrides,
  }
}

function makeJwtService(): IJwtService {
  return {
    generateToken: vi.fn().mockReturnValue('mock-jwt-token'),
    verifyToken: vi.fn(),
  }
}

describe('LoginCustomerCommand', () => {
  let repo: ICustomerRepository
  let jwtService: IJwtService
  let command: LoginCustomerCommand

  beforeEach(() => {
    repo = makeRepo()
    jwtService = makeJwtService()
    command = new LoginCustomerCommand(repo, jwtService)
  })

  it('returns token and customer info on valid credentials', async () => {
    const result = await command.execute({
      nationalId: '1234567890123',
      phoneNumber: '0812345678',
    })
    expect(result.token).toBe('mock-jwt-token')
    expect(result.fullName).toBe('Somchai Jaidee')
    expect(result.customerId).toBe('00000000-0000-0000-0000-000000000001')
  })

  it('calls generateToken with correct payload', async () => {
    await command.execute({ nationalId: '1234567890123', phoneNumber: '0812345678' })
    expect(jwtService.generateToken).toHaveBeenCalledWith({
      customerId: '00000000-0000-0000-0000-000000000001',
      nationalId: '1234567890123',
      name: 'Somchai Jaidee',
    })
  })

  it('throws when customer is not found', async () => {
    repo = makeRepo({ findByNationalId: vi.fn().mockResolvedValue(null) })
    command = new LoginCustomerCommand(repo, jwtService)
    await expect(command.execute({ nationalId: '9999999999999', phoneNumber: '0812345678' })).rejects.toThrow(
      'Invalid credentials',
    )
  })

  it('throws when phone number does not match', async () => {
    await expect(
      command.execute({ nationalId: '1234567890123', phoneNumber: '0899999999' }),
    ).rejects.toThrow('Invalid credentials')
  })

  it('does not reveal whether national ID or phone was wrong', async () => {
    repo = makeRepo({ findByNationalId: vi.fn().mockResolvedValue(null) })
    command = new LoginCustomerCommand(repo, jwtService)
    const notFound = command.execute({ nationalId: '9999999999999', phoneNumber: '0812345678' })

    const wrongPhone = new LoginCustomerCommand(makeRepo(), jwtService).execute({
      nationalId: '1234567890123',
      phoneNumber: '0899999999',
    })

    await expect(notFound).rejects.toThrow('Invalid credentials')
    await expect(wrongPhone).rejects.toThrow('Invalid credentials')
  })
})
