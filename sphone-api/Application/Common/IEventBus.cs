using SPhone.Domain.Common;

namespace SPhone.Application.Common;

public interface IEventBus
{
    Task PublishAsync<T>(T domainEvent, CancellationToken ct = default) where T : IDomainEvent;
}
