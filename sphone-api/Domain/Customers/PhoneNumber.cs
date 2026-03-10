using SPhone.Domain.Common;
using System.Text.RegularExpressions;

namespace SPhone.Domain.Customers;

public sealed class PhoneNumber : ValueObject
{
    public string Value { get; }

    public PhoneNumber(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Phone number cannot be empty.");
        var cleaned = value.Replace("-", "").Replace(" ", "");
        if (!Regex.IsMatch(cleaned, @"^0[689]\d{8}$"))
            throw new DomainException("Phone number must be a valid Thai mobile number (e.g. 0812345678).");
        Value = cleaned;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
