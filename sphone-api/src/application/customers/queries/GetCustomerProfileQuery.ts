import { ICustomerRepository } from '../../../domain/customers/ICustomerRepository'
import { ICacheService } from '../../ports/ICacheService'

export interface CustomerProfileDto {
  id: string
  fullName: string
  nationalId: string
  phoneNumber: string
  creditLimit: number
  status: number
  createdAt: string
}

export class GetCustomerProfileQuery {
  constructor(
    private readonly customerRepo: ICustomerRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(customerId: string): Promise<CustomerProfileDto> {
    const cacheKey = `customer:profile:${customerId}`
    const cached = await this.cache.get<CustomerProfileDto>(cacheKey)
    if (cached) return cached

    const customer = await this.customerRepo.findById(customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }

    const dto: CustomerProfileDto = {
      id: customer.id.value,
      fullName: customer.fullName,
      nationalId: customer.nationalId.value,
      phoneNumber: customer.phoneNumber.value,
      creditLimit: customer.creditLimit,
      status: customer.status,
      createdAt: customer.createdAt.toISOString(),
    }

    await this.cache.set(cacheKey, dto, 300)
    return dto
  }
}
