using SPhone.Domain.Common;
using SPhone.Domain.Customers;
using SPhone.Domain.Orders.Events;
using SPhone.Domain.Products;

namespace SPhone.Domain.Orders;

public sealed class Order : AggregateRoot<OrderId>
{
    public CustomerId CustomerId { get; private set; }
    public ProductId ProductId { get; private set; }
    public string ProductName { get; private set; }
    public InstallmentPlan InstallmentPlan { get; private set; }
    public OrderStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ApprovedAt { get; private set; }

    // EF Core constructor
    private Order() : base(OrderId.New())
    {
        CustomerId = null!;
        ProductId = null!;
        ProductName = null!;
        InstallmentPlan = null!;
    }

    private Order(
        OrderId id,
        CustomerId customerId,
        ProductId productId,
        string productName,
        InstallmentPlan plan) : base(id)
    {
        CustomerId = customerId;
        ProductId = productId;
        ProductName = productName;
        InstallmentPlan = plan;
        Status = OrderStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public static Order Create(
        CustomerId customerId,
        ProductId productId,
        string productName,
        InstallmentPlan plan)
    {
        var order = new Order(OrderId.New(), customerId, productId, productName, plan);
        order.RaiseDomainEvent(OrderCreatedEvent.Create(order.Id, customerId.Value, productId.Value, plan));
        return order;
    }

    public void Approve()
    {
        if (Status != OrderStatus.Pending)
            throw new DomainException("Only pending orders can be approved.");
        Status = OrderStatus.Approved;
        ApprovedAt = DateTime.UtcNow;
    }

    public void Reject()
    {
        if (Status != OrderStatus.Pending)
            throw new DomainException("Only pending orders can be rejected.");
        Status = OrderStatus.Rejected;
    }

    public void Activate()
    {
        if (Status != OrderStatus.Approved)
            throw new DomainException("Only approved orders can be activated.");
        Status = OrderStatus.Active;
    }

    public void Complete()
    {
        if (Status != OrderStatus.Active)
            throw new DomainException("Only active orders can be completed.");
        Status = OrderStatus.Completed;
    }
}
