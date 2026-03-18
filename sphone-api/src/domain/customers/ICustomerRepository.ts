import { Customer } from './Customer'

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>
  findByNationalId(nationalId: string): Promise<Customer | null>
  existsByNationalId(nationalId: string): Promise<boolean>
  save(customer: Customer): Promise<void>
}
