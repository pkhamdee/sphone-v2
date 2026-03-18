import { PrismaClient } from '@prisma/client'
import { ICustomerRepository } from '../../domain/customers/ICustomerRepository'
import { Customer } from '../../domain/customers/Customer'

export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Customer | null> {
    const row = await this.db.customer.findUnique({ where: { id } })
    if (!row) return null
    return Customer.reconstitute({
      id: row.id,
      nationalId: row.nationalId,
      fullName: row.fullName,
      phoneNumber: row.phoneNumber,
      dateOfBirth: row.dateOfBirth,
      creditLimit: Number(row.creditLimit),
      status: row.status,
      createdAt: row.createdAt,
    })
  }

  async findByNationalId(nationalId: string): Promise<Customer | null> {
    const row = await this.db.customer.findUnique({ where: { nationalId } })
    if (!row) return null
    return Customer.reconstitute({
      id: row.id,
      nationalId: row.nationalId,
      fullName: row.fullName,
      phoneNumber: row.phoneNumber,
      dateOfBirth: row.dateOfBirth,
      creditLimit: Number(row.creditLimit),
      status: row.status,
      createdAt: row.createdAt,
    })
  }

  async existsByNationalId(nationalId: string): Promise<boolean> {
    const count = await this.db.customer.count({ where: { nationalId } })
    return count > 0
  }

  async save(customer: Customer): Promise<void> {
    await this.db.customer.upsert({
      where: { id: customer.id.value },
      create: {
        id: customer.id.value,
        nationalId: customer.nationalId.value,
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber.value,
        dateOfBirth: customer.dateOfBirth,
        creditLimit: customer.creditLimit,
        status: customer.status,
        createdAt: customer.createdAt,
      },
      update: {
        fullName: customer.fullName,
        creditLimit: customer.creditLimit,
        status: customer.status,
      },
    })
  }
}
