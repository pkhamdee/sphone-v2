using SPhone.Domain.Common;

namespace SPhone.Domain.Orders;

public sealed class OrderId : ValueObject
{
    public Guid Value { get; }

    public OrderId(Guid value)
    {
        if (value == Guid.Empty) throw new ArgumentException("OrderId cannot be empty.", nameof(value));
        Value = value;
    }

    public static OrderId New() => new(Guid.NewGuid());

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value.ToString();
}
