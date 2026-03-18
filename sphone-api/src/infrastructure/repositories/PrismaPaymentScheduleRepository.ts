import { PrismaClient } from '@prisma/client'
import { IPaymentScheduleRepository } from '../../domain/payments/IPaymentScheduleRepository'
import { PaymentSchedule } from '../../domain/payments/PaymentSchedule'
import { PaymentItem } from '../../domain/payments/PaymentItem'

export class PrismaPaymentScheduleRepository implements IPaymentScheduleRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByOrderId(orderId: string): Promise<PaymentSchedule | null> {
    const row = await this.db.paymentSchedule.findUnique({
      where: { orderId },
      include: { items: { orderBy: { installmentNumber: 'asc' } } },
    })
    if (!row) return null

    const items = row.items.map(i =>
      PaymentItem.reconstitute({
        id: i.id,
        installmentNumber: i.installmentNumber,
        dueDate: i.dueDate,
        amount: Number(i.amount),
        status: i.status,
        paidAt: i.paidAt,
      }),
    )

    return PaymentSchedule.reconstitute({
      id: row.id,
      orderId: row.orderId,
      totalAmount: Number(row.totalAmount),
      totalMonths: row.totalMonths,
      items,
    })
  }

  async save(schedule: PaymentSchedule): Promise<void> {
    await this.db.paymentSchedule.upsert({
      where: { id: schedule.id.value },
      create: {
        id: schedule.id.value,
        orderId: schedule.orderId,
        totalAmount: schedule.totalAmount,
        totalMonths: schedule.totalMonths,
        items: {
          create: schedule.items.map(item => ({
            id: item.id.value,
            installmentNumber: item.installmentNumber,
            dueDate: item.dueDate,
            amount: item.amount,
            status: item.status,
            paidAt: item.paidAt,
          })),
        },
      },
      update: {},
    })
  }
}
