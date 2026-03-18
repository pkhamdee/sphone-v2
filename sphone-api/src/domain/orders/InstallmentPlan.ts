const ALLOWED_TERMS = [3, 6, 12, 18, 24]
const ANNUAL_INTEREST_RATE = 0.18

export class InstallmentPlan {
  readonly productPrice: number
  readonly downPayment: number
  readonly totalMonths: number
  readonly interestRate: number
  readonly monthlyAmount: number
  readonly totalAmount: number

  private constructor(params: {
    productPrice: number
    downPayment: number
    totalMonths: number
    interestRate: number
    monthlyAmount: number
    totalAmount: number
  }) {
    this.productPrice = params.productPrice
    this.downPayment = params.downPayment
    this.totalMonths = params.totalMonths
    this.interestRate = params.interestRate
    this.monthlyAmount = params.monthlyAmount
    this.totalAmount = params.totalAmount
  }

  static calculate(productPrice: number, downPayment: number, totalMonths: number): InstallmentPlan {
    if (!ALLOWED_TERMS.includes(totalMonths)) {
      throw new Error(`Total months must be one of: ${ALLOWED_TERMS.join(', ')}`)
    }
    if (downPayment <= 0 || downPayment >= productPrice) {
      throw new Error('Down payment must be greater than 0 and less than product price')
    }

    const principal = productPrice - downPayment
    const monthlyRate = ANNUAL_INTEREST_RATE / 12
    // PMT formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, totalMonths)
    const monthlyAmount = Math.round((principal * monthlyRate * factor) / (factor - 1) * 100) / 100
    const totalAmount = Math.round(monthlyAmount * totalMonths * 100) / 100

    if (monthlyAmount < 500) {
      throw new Error('Monthly installment must be at least 500 THB')
    }

    return new InstallmentPlan({
      productPrice,
      downPayment,
      totalMonths,
      interestRate: ANNUAL_INTEREST_RATE,
      monthlyAmount,
      totalAmount,
    })
  }

  static reconstitute(params: {
    productPrice: number
    downPayment: number
    totalMonths: number
    interestRate: number
    monthlyAmount: number
    totalAmount: number
  }): InstallmentPlan {
    return new InstallmentPlan(params)
  }
}
