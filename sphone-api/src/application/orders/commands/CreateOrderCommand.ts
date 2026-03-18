import { v4 as uuidv4 } from 'uuid'
import { ICustomerRepository } from '../../../domain/customers/ICustomerRepository'
import { IProductRepository } from '../../../domain/products/IProductRepository'
import { IOrderRepository } from '../../../domain/orders/IOrderRepository'
import { IPaymentScheduleRepository } from '../../../domain/payments/IPaymentScheduleRepository'
import { IEventBus } from '../../ports/IEventBus'
import { Order } from '../../../domain/orders/Order'
import { PaymentSchedule } from '../../../domain/payments/PaymentSchedule'
import { ordersCreatedCounter, orderInstallmentAmountHistogram } from '../../../infrastructure/observability/metrics'

export interface CreateOrderInput {
  customerId: string
  productId: string
  downPayment: number
  totalMonths: number
}

export interface CreateOrderResult {
  orderId: string
  monthlyAmount: number
  totalAmount: number
  totalMonths: number
}

export class CreateOrderCommand {
  constructor(
    private readonly customerRepo: ICustomerRepository,
    private readonly productRepo: IProductRepository,
    private readonly orderRepo: IOrderRepository,
    private readonly paymentScheduleRepo: IPaymentScheduleRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderResult> {
    const customer = await this.customerRepo.findById(input.customerId)
    if (!customer) throw new Error('Customer not found')
    if (!customer.canPlaceOrder()) throw new Error('Customer is not eligible to place an order')

    const product = await this.productRepo.findById(input.productId)
    if (!product) throw new Error('Product not found')
    if (!product.isAvailable) throw new Error('Product is not available')

    const orderId = uuidv4()
    const order = Order.create({
      id: orderId,
      customerId: customer.id.value,
      productId: product.id.value,
      productName: product.name,
      productPrice: product.price.amount,
      downPayment: input.downPayment,
      totalMonths: input.totalMonths,
      creditLimit: customer.creditLimit,
    })

    await this.orderRepo.save(order)

    const scheduleId = uuidv4()
    const schedule = PaymentSchedule.createForOrder({
      id: scheduleId,
      orderId: order.id.value,
      monthlyAmount: order.installmentPlan.monthlyAmount,
      totalMonths: order.installmentPlan.totalMonths,
      startDate: new Date(),
    })

    await this.paymentScheduleRepo.save(schedule)

    for (const event of order.getDomainEvents()) {
      await this.eventBus.publish(event)
    }

    ordersCreatedCounter.add(1, { product_category: product.category })
    orderInstallmentAmountHistogram.record(order.installmentPlan.monthlyAmount, {
      total_months: String(order.installmentPlan.totalMonths),
    })

    return {
      orderId: order.id.value,
      monthlyAmount: order.installmentPlan.monthlyAmount,
      totalAmount: order.installmentPlan.totalAmount,
      totalMonths: order.installmentPlan.totalMonths,
    }
  }
}
