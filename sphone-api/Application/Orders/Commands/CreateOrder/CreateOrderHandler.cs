using SPhone.Application.Common;
using SPhone.Domain.Common;
using SPhone.Domain.Customers;
using SPhone.Domain.Customers.Ports;
using SPhone.Domain.Orders;
using SPhone.Domain.Orders.Ports;
using SPhone.Domain.Payments;
using SPhone.Domain.Payments.Ports;
using SPhone.Domain.Products;
using SPhone.Domain.Products.Ports;

namespace SPhone.Application.Orders.Commands.CreateOrder;

public sealed class CreateOrderHandler(
    ICustomerRepository customerRepository,
    IProductRepository productRepository,
    IOrderRepository orderRepository,
    IPaymentScheduleRepository paymentScheduleRepository,
    IUnitOfWork unitOfWork,
    IEventBus eventBus) : ICommandHandler<CreateOrderCommand, CreateOrderResult>
{
    public async Task<CreateOrderResult> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var customerId = new CustomerId(command.CustomerId);
        var customer = await customerRepository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), command.CustomerId);

        if (customer.Status != CustomerStatus.Pending && customer.Status != CustomerStatus.Verified)
            throw new DomainException("Customer account is not eligible for orders.");

        var productId = new ProductId(command.ProductId);
        var product = await productRepository.GetByIdAsync(productId, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), command.ProductId);

        if (!product.IsAvailable)
            throw new DomainException("This product is currently not available.");

        if (command.DownPayment >= product.Price.Amount)
            throw new DomainException("Down payment cannot exceed product price.");

        var plan = new InstallmentPlan(product.Price.Amount, command.DownPayment, command.TotalMonths);

        if (plan.MonthlyAmount < 500)
            throw new DomainException("Monthly installment must be at least 500 THB.");

        if (plan.TotalAmount - command.DownPayment > customer.CreditLimit)
            throw new DomainException($"Order exceeds credit limit of {customer.CreditLimit:N0} THB.");

        var order = Order.Create(customerId, productId, product.Name, plan);
        order.Approve(); // Auto-approve for now; in production this would go through credit check

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var schedule = PaymentSchedule.CreateForOrder(order.Id, plan.MonthlyAmount, plan.TotalMonths, startDate);

        await orderRepository.AddAsync(order, cancellationToken);
        await paymentScheduleRepository.AddAsync(schedule, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var domainEvent in order.PopDomainEvents())
            await eventBus.PublishAsync(domainEvent, cancellationToken);

        // Record custom metrics
        SPhoneMetrics.OrdersCreated.Add(1,
            new KeyValuePair<string, object?>("product.category", product.Category.ToString()));
        SPhoneMetrics.InstallmentAmountThb.Record((double)plan.MonthlyAmount,
            new KeyValuePair<string, object?>("months", plan.TotalMonths));
        SPhoneMetrics.OrderTotalThb.Record((double)plan.TotalAmount);

        return new CreateOrderResult(order.Id.Value, plan.MonthlyAmount, plan.TotalAmount, plan.TotalMonths);
    }
}
