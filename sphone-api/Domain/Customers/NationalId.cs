using SPhone.Domain.Common;
using System.Text.RegularExpressions;

namespace SPhone.Domain.Customers;

public sealed class NationalId : ValueObject
{
    public string Value { get; }

    public NationalId(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("National ID cannot be empty.");
        if (!Regex.IsMatch(value, @"^\d{13}$"))
            throw new DomainException("National ID must be exactly 13 digits.");
        Value = value;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
