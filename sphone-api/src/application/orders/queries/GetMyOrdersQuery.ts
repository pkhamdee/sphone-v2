import { IOrderRepository } from '../../../domain/orders/IOrderRepository'

export interface OrderSummaryDto {
  orderId: string
  productName: string
  monthlyAmount: number
  totalAmount: number
  totalMonths: number
  status: number
  createdAt: string
}

export class GetMyOrdersQuery {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(customerId: string): Promise<OrderSummaryDto[]> {
    const orders = await this.orderRepo.findByCustomerId(customerId)
    return orders.map(o => ({
      orderId: o.id.value,
      productName: o.productName,
      monthlyAmount: o.installmentPlan.monthlyAmount,
      totalAmount: o.installmentPlan.totalAmount,
      totalMonths: o.installmentPlan.totalMonths,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }))
  }
}
