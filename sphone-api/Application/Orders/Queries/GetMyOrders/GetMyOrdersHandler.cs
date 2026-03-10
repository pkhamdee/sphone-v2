using SPhone.Application.Common;
using SPhone.Domain.Customers;
using SPhone.Domain.Orders.Ports;

namespace SPhone.Application.Orders.Queries.GetMyOrders;

public sealed class GetMyOrdersHandler(
    IOrderRepository orderRepository) : IQueryHandler<GetMyOrdersQuery, IReadOnlyList<OrderSummaryDto>>
{
    public async Task<IReadOnlyList<OrderSummaryDto>> Handle(GetMyOrdersQuery query, CancellationToken cancellationToken)
    {
        var customerId = new CustomerId(query.CustomerId);
        var orders = await orderRepository.GetByCustomerIdAsync(customerId, cancellationToken);

        return orders.Select(o => new OrderSummaryDto(
            o.Id.Value,
            o.ProductName,
            o.InstallmentPlan.MonthlyAmount,
            o.InstallmentPlan.TotalAmount,
            o.InstallmentPlan.TotalMonths,
            o.Status.ToString(),
            o.CreatedAt)).ToList();
    }
}
