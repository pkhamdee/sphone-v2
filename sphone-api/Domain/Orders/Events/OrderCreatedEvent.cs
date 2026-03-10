using SPhone.Domain.Common;

namespace SPhone.Domain.Orders.Events;

public sealed record OrderCreatedEvent(
    Guid EventId,
    DateTime OccurredAt,
    Guid OrderId,
    Guid CustomerId,
    Guid ProductId,
    decimal MonthlyAmount,
    int TotalMonths) : IDomainEvent
{
    public static OrderCreatedEvent Create(OrderId orderId, Guid customerId, Guid productId, InstallmentPlan plan) =>
        new(Guid.NewGuid(), DateTime.UtcNow, orderId.Value, customerId, productId, plan.MonthlyAmount, plan.TotalMonths);
}
