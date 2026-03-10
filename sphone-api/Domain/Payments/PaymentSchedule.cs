using SPhone.Domain.Common;
using SPhone.Domain.Orders;

namespace SPhone.Domain.Payments;

public sealed class PaymentSchedule : AggregateRoot<PaymentScheduleId>
{
    private readonly List<PaymentItem> _items = [];

    public OrderId OrderId { get; private set; }
    public decimal TotalAmount { get; private set; }
    public int TotalMonths { get; private set; }
    public IReadOnlyList<PaymentItem> Items => _items.AsReadOnly();

    // EF Core constructor
    private PaymentSchedule() : base(PaymentScheduleId.New())
    {
        OrderId = null!;
    }

    private PaymentSchedule(PaymentScheduleId id, OrderId orderId, decimal totalAmount, int totalMonths)
        : base(id)
    {
        OrderId = orderId;
        TotalAmount = totalAmount;
        TotalMonths = totalMonths;
    }

    public static PaymentSchedule CreateForOrder(OrderId orderId, decimal monthlyAmount, int totalMonths, DateOnly startDate)
    {
        var schedule = new PaymentSchedule(PaymentScheduleId.New(), orderId, monthlyAmount * totalMonths, totalMonths);
        for (int i = 1; i <= totalMonths; i++)
        {
            var dueDate = startDate.AddMonths(i);
            schedule._items.Add(new PaymentItem(schedule.Id, i, dueDate, monthlyAmount));
        }
        return schedule;
    }

    public void RecordPayment(int installmentNumber)
    {
        var item = _items.FirstOrDefault(x => x.InstallmentNumber == installmentNumber)
            ?? throw new DomainException($"Installment #{installmentNumber} not found.");
        item.MarkAsPaid();
    }
}
