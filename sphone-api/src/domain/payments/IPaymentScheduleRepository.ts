import { PaymentSchedule } from './PaymentSchedule'

export interface IPaymentScheduleRepository {
  findByOrderId(orderId: string): Promise<PaymentSchedule | null>
  save(schedule: PaymentSchedule): Promise<void>
}
