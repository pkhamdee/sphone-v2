import { ValueObject } from '../shared/ValueObject'

export class PaymentScheduleId extends ValueObject<string> {
  static create(id: string): PaymentScheduleId {
    return new PaymentScheduleId(id)
  }

  toString(): string {
    return this._value
  }
}
