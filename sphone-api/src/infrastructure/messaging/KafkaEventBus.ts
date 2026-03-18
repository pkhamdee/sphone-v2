import { Kafka, Producer } from 'kafkajs'
import { IEventBus } from '../../application/ports/IEventBus'
import { DomainEvent } from '../../domain/shared/DomainEvent'

let producer: Producer | null = null

async function getProducer(): Promise<Producer> {
  if (!producer) {
    const kafka = new Kafka({
      clientId: 'sphone-api',
      brokers: [process.env.KAFKA_BROKERS ?? 'localhost:9092'],
      retry: { retries: 3 },
    })
    producer = kafka.producer()
    await producer.connect()
  }
  return producer
}

export class KafkaEventBus implements IEventBus {
  async publish(event: DomainEvent): Promise<void> {
    try {
      const prod = await getProducer()
      await prod.send({
        topic: `sphone.${event.eventType}`,
        messages: [
          {
            key: event.eventId,
            value: JSON.stringify(event),
            headers: {
              eventType: event.eventType,
              occurredAt: event.occurredAt.toISOString(),
            },
          },
        ],
      })
    } catch (err) {
      console.error(`[Kafka] Failed to publish event ${event.eventType}:`, err)
      producer = null  // reset so next call reconnects
    }
  }
}
