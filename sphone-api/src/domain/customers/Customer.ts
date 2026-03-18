import { AggregateRoot } from '../shared/AggregateRoot'
import { CustomerId } from './CustomerId'
import { NationalId } from './NationalId'
import { PhoneNumber } from './PhoneNumber'
import { CustomerStatus } from './CustomerStatus'
import { CustomerRegisteredEvent } from './events/CustomerRegisteredEvent'

export class Customer extends AggregateRoot {
  private constructor(
    private readonly _id: CustomerId,
    private readonly _nationalId: NationalId,
    private _fullName: string,
    private readonly _phoneNumber: PhoneNumber,
    private readonly _dateOfBirth: Date,
    private _creditLimit: number,
    private _status: CustomerStatus,
    private readonly _createdAt: Date,
  ) {
    super()
  }

  get id(): CustomerId { return this._id }
  get nationalId(): NationalId { return this._nationalId }
  get fullName(): string { return this._fullName }
  get phoneNumber(): PhoneNumber { return this._phoneNumber }
  get dateOfBirth(): Date { return this._dateOfBirth }
  get creditLimit(): number { return this._creditLimit }
  get status(): CustomerStatus { return this._status }
  get createdAt(): Date { return this._createdAt }

  static create(params: {
    id: string
    nationalId: string
    fullName: string
    phoneNumber: string
    dateOfBirth: Date
  }): Customer {
    const customer = new Customer(
      CustomerId.create(params.id),
      NationalId.create(params.nationalId),
      params.fullName,
      PhoneNumber.create(params.phoneNumber),
      params.dateOfBirth,
      100000,
      CustomerStatus.Pending,
      new Date(),
    )
    customer.addDomainEvent(
      new CustomerRegisteredEvent(params.id, params.nationalId, params.fullName),
    )
    return customer
  }

  static reconstitute(params: {
    id: string
    nationalId: string
    fullName: string
    phoneNumber: string
    dateOfBirth: Date
    creditLimit: number
    status: number
    createdAt: Date
  }): Customer {
    return new Customer(
      CustomerId.create(params.id),
      NationalId.create(params.nationalId),
      params.fullName,
      PhoneNumber.create(params.phoneNumber),
      params.dateOfBirth,
      params.creditLimit,
      params.status as CustomerStatus,
      params.createdAt,
    )
  }

  canPlaceOrder(): boolean {
    return this._status === CustomerStatus.Pending || this._status === CustomerStatus.Verified
  }
}
