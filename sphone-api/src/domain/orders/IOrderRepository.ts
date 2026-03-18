import { Order } from './Order'

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>
  findByCustomerId(customerId: string): Promise<Order[]>
  save(order: Order): Promise<void>
}
