import { IPaymentScheduleRepository } from '../../../domain/payments/IPaymentScheduleRepository'

export interface PaymentItemDto {
  id: string
  installmentNumber: number
  dueDate: string
  amount: number
  status: number
  paidAt: string | null
}

export interface PaymentScheduleDto {
  scheduleId: string
  orderId: string
  totalAmount: number
  totalMonths: number
  items: PaymentItemDto[]
}

export class GetPaymentScheduleQuery {
  constructor(private readonly paymentScheduleRepo: IPaymentScheduleRepository) {}

  async execute(orderId: string): Promise<PaymentScheduleDto> {
    const schedule = await this.paymentScheduleRepo.findByOrderId(orderId)
    if (!schedule) throw new Error('Payment schedule not found')

    return {
      scheduleId: schedule.id.value,
      orderId: schedule.orderId,
      totalAmount: schedule.totalAmount,
      totalMonths: schedule.totalMonths,
      items: schedule.items.map(item => ({
        id: item.id.value,
        installmentNumber: item.installmentNumber,
        dueDate: item.dueDate.toISOString(),
        amount: item.amount,
        status: item.status,
        paidAt: item.paidAt?.toISOString() ?? null,
      })),
    }
  }
}
