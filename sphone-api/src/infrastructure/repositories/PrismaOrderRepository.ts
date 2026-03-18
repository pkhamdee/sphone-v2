import { PrismaClient } from '@prisma/client'
import { IOrderRepository } from '../../domain/orders/IOrderRepository'
import { Order } from '../../domain/orders/Order'

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly db: PrismaClient) {}

  private mapRow(row: any): Order {
    return Order.reconstitute({
      id: row.id,
      customerId: row.customerId,
      productId: row.productId,
      productName: row.productName,
      installmentProductPrice: Number(row.installmentProductPrice),
      installmentDownPayment: Number(row.installmentDownPayment),
      installmentTotalMonths: row.installmentTotalMonths,
      installmentInterestRate: Number(row.installmentInterestRate),
      installmentMonthlyAmount: Number(row.installmentMonthlyAmount),
      installmentTotalAmount: Number(row.installmentTotalAmount),
      status: row.status,
      createdAt: row.createdAt,
      approvedAt: row.approvedAt,
    })
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.order.findUnique({ where: { id } })
    return row ? this.mapRow(row) : null
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await this.db.order.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' } })
    return rows.map(r => this.mapRow(r))
  }

  async save(order: Order): Promise<void> {
    await this.db.order.upsert({
      where: { id: order.id.value },
      create: {
        id: order.id.value,
        customerId: order.customerId,
        productId: order.productId,
        productName: order.productName,
        installmentProductPrice: order.installmentPlan.productPrice,
        installmentDownPayment: order.installmentPlan.downPayment,
        installmentTotalMonths: order.installmentPlan.totalMonths,
        installmentInterestRate: order.installmentPlan.interestRate,
        installmentMonthlyAmount: order.installmentPlan.monthlyAmount,
        installmentTotalAmount: order.installmentPlan.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        approvedAt: order.approvedAt,
      },
      update: {
        status: order.status,
        approvedAt: order.approvedAt,
      },
    })
  }
}
