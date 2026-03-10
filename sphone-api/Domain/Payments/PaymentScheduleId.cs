using SPhone.Domain.Common;

namespace SPhone.Domain.Payments;

public sealed class PaymentScheduleId : ValueObject
{
    public Guid Value { get; }

    public PaymentScheduleId(Guid value)
    {
        if (value == Guid.Empty) throw new ArgumentException("PaymentScheduleId cannot be empty.", nameof(value));
        Value = value;
    }

    public static PaymentScheduleId New() => new(Guid.NewGuid());

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value.ToString();
}
