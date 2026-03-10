using SPhone.Application.Common;

namespace SPhone.Application.Orders.Queries.GetMyOrders;

public sealed record GetMyOrdersQuery(Guid CustomerId) : IQuery<IReadOnlyList<OrderSummaryDto>>;

public sealed record OrderSummaryDto(
    Guid OrderId,
    string ProductName,
    decimal MonthlyAmount,
    decimal TotalAmount,
    int TotalMonths,
    string Status,
    DateTime CreatedAt);
