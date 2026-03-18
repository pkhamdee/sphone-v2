import { ValueObject } from '../shared/ValueObject'

export class PaymentItemId extends ValueObject<string> {
  static create(id: string): PaymentItemId {
    return new PaymentItemId(id)
  }

  toString(): string {
    return this._value
  }
}
