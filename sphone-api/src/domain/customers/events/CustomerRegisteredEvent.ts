import { DomainEvent } from '../../shared/DomainEvent'
import { v4 as uuidv4 } from 'uuid'

export class CustomerRegisteredEvent implements DomainEvent {
  readonly eventId: string
  readonly occurredAt: Date
  readonly eventType = 'CustomerRegistered'

  constructor(
    public readonly customerId: string,
    public readonly nationalId: string,
    public readonly fullName: string,
  ) {
    this.eventId = uuidv4()
    this.occurredAt = new Date()
  }
}
