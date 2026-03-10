using SPhone.Domain.Common;

namespace SPhone.Domain.Payments;

public sealed class PaymentItem : Entity<Guid>
{
    public PaymentScheduleId PaymentScheduleId { get; private set; }
    public int InstallmentNumber { get; private set; }
    public DateOnly DueDate { get; private set; }
    public decimal Amount { get; private set; }
    public PaymentStatus Status { get; private set; }
    public DateTime? PaidAt { get; private set; }

    // EF Core constructor
    private PaymentItem() : base(Guid.NewGuid())
    {
        PaymentScheduleId = null!;
    }

    internal PaymentItem(
        PaymentScheduleId scheduleId,
        int installmentNumber,
        DateOnly dueDate,
        decimal amount) : base(Guid.NewGuid())
    {
        PaymentScheduleId = scheduleId;
        InstallmentNumber = installmentNumber;
        DueDate = dueDate;
        Amount = amount;
        Status = PaymentStatus.Pending;
    }

    public void MarkAsPaid()
    {
        if (Status == PaymentStatus.Paid) throw new DomainException("Payment already paid.");
        Status = PaymentStatus.Paid;
        PaidAt = DateTime.UtcNow;
    }

    public void MarkAsOverdue()
    {
        if (Status != PaymentStatus.Pending) return;
        Status = PaymentStatus.Overdue;
    }
}
