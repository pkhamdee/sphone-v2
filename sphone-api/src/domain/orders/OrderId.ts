import { ValueObject } from '../shared/ValueObject'

export class OrderId extends ValueObject<string> {
  static create(id: string): OrderId {
    return new OrderId(id)
  }

  toString(): string {
    return this._value
  }
}
