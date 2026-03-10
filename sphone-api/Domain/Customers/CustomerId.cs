using SPhone.Domain.Common;

namespace SPhone.Domain.Customers;

public sealed class CustomerId : ValueObject
{
    public Guid Value { get; }

    public CustomerId(Guid value)
    {
        if (value == Guid.Empty) throw new ArgumentException("CustomerId cannot be empty.", nameof(value));
        Value = value;
    }

    public static CustomerId New() => new(Guid.NewGuid());

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value.ToString();
}
