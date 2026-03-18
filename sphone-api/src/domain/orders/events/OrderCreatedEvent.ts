import { DomainEvent } from '../../shared/DomainEvent'
import { v4 as uuidv4 } from 'uuid'

export class OrderCreatedEvent implements DomainEvent {
  readonly eventId: string
  readonly occurredAt: Date
  readonly eventType = 'OrderCreated'

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly productId: string,
    public readonly monthlyAmount: number,
    public readonly totalMonths: number,
  ) {
    this.eventId = uuidv4()
    this.occurredAt = new Date()
  }
}
