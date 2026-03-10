using SPhone.Domain.Common;

namespace SPhone.Domain.Customers.Events;

public sealed record CustomerRegisteredEvent(
    Guid EventId,
    DateTime OccurredAt,
    Guid CustomerId,
    string NationalId,
    string FullName,
    string PhoneNumber) : IDomainEvent
{
    public static CustomerRegisteredEvent Create(CustomerId customerId, NationalId nationalId, string fullName, PhoneNumber phoneNumber) =>
        new(Guid.NewGuid(), DateTime.UtcNow, customerId.Value, nationalId.Value, fullName, phoneNumber.Value);
}
