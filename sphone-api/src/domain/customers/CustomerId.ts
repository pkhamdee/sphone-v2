import { ValueObject } from '../shared/ValueObject'

export class CustomerId extends ValueObject<string> {
  static create(id: string): CustomerId {
    return new CustomerId(id)
  }

  toString(): string {
    return this._value
  }
}
