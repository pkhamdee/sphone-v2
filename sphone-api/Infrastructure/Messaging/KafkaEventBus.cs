using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SPhone.Application.Common;
using SPhone.Domain.Common;

namespace SPhone.Infrastructure.Messaging;

public class KafkaEventBus(IConfiguration configuration, ILogger<KafkaEventBus> logger) : IEventBus, IDisposable
{
    private readonly IProducer<string, string> _producer = new ProducerBuilder<string, string>(
        new ProducerConfig
        {
            BootstrapServers = configuration["Kafka:BootstrapServers"] ?? "localhost:9092",
            Acks = Acks.Leader
        }).Build();

    private static readonly Dictionary<string, string> TopicMap = new()
    {
        { "CustomerRegisteredEvent", "sphone.customers" },
        { "CustomerVerifiedEvent", "sphone.customers" },
        { "OrderCreatedEvent", "sphone.orders" },
        { "OrderApprovedEvent", "sphone.orders" },
    };

    public async Task PublishAsync<T>(T domainEvent, CancellationToken ct = default) where T : IDomainEvent
    {
        var eventName = domainEvent.GetType().Name;
        var topic = TopicMap.GetValueOrDefault(eventName, "sphone.events");

        try
        {
            var payload = JsonSerializer.Serialize(domainEvent, domainEvent.GetType());
            var message = new Message<string, string>
            {
                Key = domainEvent.EventId.ToString(),
                Value = payload,
                Headers = [new Header("event-type", System.Text.Encoding.UTF8.GetBytes(eventName))]
            };

            await _producer.ProduceAsync(topic, message, ct);
            logger.LogInformation("Published {EventType} to {Topic}", eventName, topic);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to publish {EventType} to Kafka", eventName);
            // Don't throw — event publishing failure should not fail the command
        }
    }

    public void Dispose() => _producer.Dispose();
}
