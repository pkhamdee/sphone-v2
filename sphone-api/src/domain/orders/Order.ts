import { AggregateRoot } from '../shared/AggregateRoot'
import { OrderId } from './OrderId'
import { OrderStatus } from './OrderStatus'
import { InstallmentPlan } from './InstallmentPlan'
import { OrderCreatedEvent } from './events/OrderCreatedEvent'

export class Order extends AggregateRoot {
  private constructor(
    private readonly _id: OrderId,
    private readonly _customerId: string,
    private readonly _productId: string,
    private readonly _productName: string,
    private readonly _installmentPlan: InstallmentPlan,
    private _status: OrderStatus,
    private readonly _createdAt: Date,
    private _approvedAt: Date | null,
  ) {
    super()
  }

  get id(): OrderId { return this._id }
  get customerId(): string { return this._customerId }
  get productId(): string { return this._productId }
  get productName(): string { return this._productName }
  get installmentPlan(): InstallmentPlan { return this._installmentPlan }
  get status(): OrderStatus { return this._status }
  get createdAt(): Date { return this._createdAt }
  get approvedAt(): Date | null { return this._approvedAt }

  static create(params: {
    id: string
    customerId: string
    productId: string
    productName: string
    productPrice: number
    downPayment: number
    totalMonths: number
    creditLimit: number
  }): Order {
    const plan = InstallmentPlan.calculate(params.productPrice, params.downPayment, params.totalMonths)

    if (plan.totalAmount > params.creditLimit) {
      throw new Error(`Total installment amount ${plan.totalAmount} exceeds credit limit ${params.creditLimit}`)
    }

    const order = new Order(
      OrderId.create(params.id),
      params.customerId,
      params.productId,
      params.productName,
      plan,
      OrderStatus.Pending,
      new Date(),
      null,
    )

    order.approve()
    order.addDomainEvent(
      new OrderCreatedEvent(params.id, params.customerId, params.productId, plan.monthlyAmount, plan.totalMonths),
    )
    return order
  }

  static reconstitute(params: {
    id: string
    customerId: string
    productId: string
    productName: string
    installmentProductPrice: number
    installmentDownPayment: number
    installmentTotalMonths: number
    installmentInterestRate: number
    installmentMonthlyAmount: number
    installmentTotalAmount: number
    status: number
    createdAt: Date
    approvedAt: Date | null
  }): Order {
    return new Order(
      OrderId.create(params.id),
      params.customerId,
      params.productId,
      params.productName,
      InstallmentPlan.reconstitute({
        productPrice: params.installmentProductPrice,
        downPayment: params.installmentDownPayment,
        totalMonths: params.installmentTotalMonths,
        interestRate: params.installmentInterestRate,
        monthlyAmount: params.installmentMonthlyAmount,
        totalAmount: params.installmentTotalAmount,
      }),
      params.status as OrderStatus,
      params.createdAt,
      params.approvedAt,
    )
  }

  private approve(): void {
    this._status = OrderStatus.Approved
    this._approvedAt = new Date()
  }
}
