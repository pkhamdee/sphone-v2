import { PaymentItemId } from './PaymentItemId'
import { PaymentStatus } from './PaymentStatus'

export class PaymentItem {
  private constructor(
    private readonly _id: PaymentItemId,
    private readonly _installmentNumber: number,
    private readonly _dueDate: Date,
    private readonly _amount: number,
    private _status: PaymentStatus,
    private _paidAt: Date | null,
  ) {}

  get id(): PaymentItemId { return this._id }
  get installmentNumber(): number { return this._installmentNumber }
  get dueDate(): Date { return this._dueDate }
  get amount(): number { return this._amount }
  get status(): PaymentStatus { return this._status }
  get paidAt(): Date | null { return this._paidAt }

  static create(params: {
    id: string
    installmentNumber: number
    dueDate: Date
    amount: number
  }): PaymentItem {
    return new PaymentItem(
      PaymentItemId.create(params.id),
      params.installmentNumber,
      params.dueDate,
      params.amount,
      PaymentStatus.Pending,
      null,
    )
  }

  static reconstitute(params: {
    id: string
    installmentNumber: number
    dueDate: Date
    amount: number
    status: number
    paidAt: Date | null
  }): PaymentItem {
    return new PaymentItem(
      PaymentItemId.create(params.id),
      params.installmentNumber,
      params.dueDate,
      params.amount,
      params.status as PaymentStatus,
      params.paidAt,
    )
  }
}
