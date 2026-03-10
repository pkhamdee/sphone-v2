using SPhone.Application.Common;

namespace SPhone.Application.Orders.Commands.CreateOrder;

public sealed record CreateOrderCommand(
    Guid CustomerId,
    Guid ProductId,
    decimal DownPayment,
    int TotalMonths) : ICommand<CreateOrderResult>;

public sealed record CreateOrderResult(
    Guid OrderId,
    decimal MonthlyAmount,
    decimal TotalAmount,
    int TotalMonths);
