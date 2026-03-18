import { ValueObject } from '../shared/ValueObject'

export class ProductId extends ValueObject<string> {
  static create(id: string): ProductId {
    return new ProductId(id)
  }

  toString(): string {
    return this._value
  }
}
