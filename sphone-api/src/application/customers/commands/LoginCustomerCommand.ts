import { ICustomerRepository } from '../../../domain/customers/ICustomerRepository'
import { IJwtService } from '../../ports/IJwtService'

export interface LoginCustomerInput {
  nationalId: string
  phoneNumber: string
}

export interface LoginCustomerResult {
  token: string
  customerId: string
  fullName: string
}

export class LoginCustomerCommand {
  constructor(
    private readonly customerRepo: ICustomerRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: LoginCustomerInput): Promise<LoginCustomerResult> {
    const customer = await this.customerRepo.findByNationalId(input.nationalId)
    if (!customer) {
      throw new Error('Invalid credentials')
    }

    if (customer.phoneNumber.value !== input.phoneNumber) {
      throw new Error('Invalid credentials')
    }

    const token = this.jwtService.generateToken({
      customerId: customer.id.value,
      nationalId: customer.nationalId.value,
      name: customer.fullName,
    })

    return {
      token,
      customerId: customer.id.value,
      fullName: customer.fullName,
    }
  }
}
