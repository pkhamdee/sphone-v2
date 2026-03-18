import { DomainEvent } from './DomainEvent'

export abstract class AggregateRoot {
  private readonly _domainEvents: DomainEvent[] = []

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents]
  }

  clearDomainEvents(): void {
    this._domainEvents.length = 0
  }
}
