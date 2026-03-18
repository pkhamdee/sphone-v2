import { ValueObject } from '../shared/ValueObject'

export class PhoneNumber extends ValueObject<string> {
  private constructor(value: string) {
    super(value)
  }

  static create(value: string): PhoneNumber {
    if (!/^0[689]\d{8}$/.test(value)) {
      throw new Error('Phone number must be a valid Thai mobile number (0[689]xxxxxxxx)')
    }
    return new PhoneNumber(value)
  }
}
