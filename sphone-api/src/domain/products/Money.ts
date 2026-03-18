import { ValueObject } from '../shared/ValueObject'

export class Money extends ValueObject<{ amount: number; currency: string }> {
  private constructor(amount: number, currency: string) {
    super({ amount, currency })
  }

  static create(amount: number, currency = 'THB'): Money {
    if (amount < 0) throw new Error('Amount cannot be negative')
    return new Money(amount, currency)
  }

  get amount(): number { return this._value.amount }
  get currency(): string { return this._value.currency }

  add(other: Money): Money {
    return new Money(this.amount + other.amount, this.currency)
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor * 100) / 100, this.currency)
  }
}
