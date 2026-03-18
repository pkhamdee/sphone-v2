import { v4 as uuidv4 } from 'uuid'
import { ICustomerRepository } from '../../../domain/customers/ICustomerRepository'
import { Customer } from '../../../domain/customers/Customer'
import { IEventBus } from '../../ports/IEventBus'
import { customersRegisteredCounter } from '../../../infrastructure/observability/metrics'

export interface RegisterCustomerInput {
  nationalId: string
  fullName: string
  phoneNumber: string
  dateOfBirth: string
}

export interface RegisterCustomerResult {
  customerId: string
  fullName: string
}

export class RegisterCustomerCommand {
  constructor(
    private readonly customerRepo: ICustomerRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: RegisterCustomerInput): Promise<RegisterCustomerResult> {
    const exists = await this.customerRepo.existsByNationalId(input.nationalId)
    if (exists) {
      throw new Error('Customer with this national ID already exists')
    }

    const customerId = uuidv4()
    const customer = Customer.create({
      id: customerId,
      nationalId: input.nationalId,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      dateOfBirth: new Date(input.dateOfBirth),
    })

    await this.customerRepo.save(customer)

    for (const event of customer.getDomainEvents()) {
      await this.eventBus.publish(event)
    }

    customersRegisteredCounter.add(1)

    return { customerId, fullName: customer.fullName }
  }
}
