import { ValueObject } from '../shared/ValueObject'

export class NationalId extends ValueObject<string> {
  private constructor(value: string) {
    super(value)
  }

  static create(value: string): NationalId {
    if (!/^\d{13}$/.test(value)) {
      throw new Error('National ID must be exactly 13 digits')
    }
    return new NationalId(value)
  }
}
