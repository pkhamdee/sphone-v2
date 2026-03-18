import { AggregateRoot } from '../shared/AggregateRoot'
import { PaymentScheduleId } from './PaymentScheduleId'
import { PaymentItem } from './PaymentItem'
import { v4 as uuidv4 } from 'uuid'

export class PaymentSchedule extends AggregateRoot {
  private constructor(
    private readonly _id: PaymentScheduleId,
    private readonly _orderId: string,
    private readonly _totalAmount: number,
    private readonly _totalMonths: number,
    private readonly _items: PaymentItem[],
  ) {
    super()
  }

  get id(): PaymentScheduleId { return this._id }
  get orderId(): string { return this._orderId }
  get totalAmount(): number { return this._totalAmount }
  get totalMonths(): number { return this._totalMonths }
  get items(): PaymentItem[] { return [...this._items] }

  static createForOrder(params: {
    id: string
    orderId: string
    monthlyAmount: number
    totalMonths: number
    startDate: Date
  }): PaymentSchedule {
    const items: PaymentItem[] = []
    const start = new Date(params.startDate)

    for (let i = 1; i <= params.totalMonths; i++) {
      const dueDate = new Date(start)
      dueDate.setMonth(dueDate.getMonth() + i)

      items.push(PaymentItem.create({
        id: uuidv4(),
        installmentNumber: i,
        dueDate,
        amount: params.monthlyAmount,
      }))
    }

    const totalAmount = Math.round(params.monthlyAmount * params.totalMonths * 100) / 100
    return new PaymentSchedule(
      PaymentScheduleId.create(params.id),
      params.orderId,
      totalAmount,
      params.totalMonths,
      items,
    )
  }

  static reconstitute(params: {
    id: string
    orderId: string
    totalAmount: number
    totalMonths: number
    items: PaymentItem[]
  }): PaymentSchedule {
    return new PaymentSchedule(
      PaymentScheduleId.create(params.id),
      params.orderId,
      params.totalAmount,
      params.totalMonths,
      params.items,
    )
  }
}
