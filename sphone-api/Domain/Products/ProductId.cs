using SPhone.Domain.Common;

namespace SPhone.Domain.Products;

public sealed class ProductId : ValueObject
{
    public Guid Value { get; }

    public ProductId(Guid value)
    {
        if (value == Guid.Empty) throw new ArgumentException("ProductId cannot be empty.", nameof(value));
        Value = value;
    }

    public static ProductId New() => new(Guid.NewGuid());

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value.ToString();
}
