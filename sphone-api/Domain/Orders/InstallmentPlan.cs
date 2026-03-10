using SPhone.Domain.Common;

namespace SPhone.Domain.Orders;

public sealed class InstallmentPlan : ValueObject
{
    public decimal ProductPrice { get; }
    public decimal DownPayment { get; }
    public int TotalMonths { get; }
    public decimal InterestRate { get; } // annual interest rate as decimal e.g. 0.18 = 18%
    public decimal MonthlyAmount { get; }
    public decimal TotalAmount { get; }

    public InstallmentPlan(decimal productPrice, decimal downPayment, int totalMonths, decimal interestRate = 0.18m)
    {
        if (productPrice <= 0) throw new DomainException("Product price must be positive.");
        if (downPayment < 0) throw new DomainException("Down payment cannot be negative.");
        if (downPayment >= productPrice) throw new DomainException("Down payment cannot exceed product price.");
        if (totalMonths is not (3 or 6 or 12 or 18 or 24))
            throw new DomainException("Installment plan must be 3, 6, 12, 18, or 24 months.");

        ProductPrice = productPrice;
        DownPayment = downPayment;
        TotalMonths = totalMonths;
        InterestRate = interestRate;

        var principal = productPrice - downPayment;
        var monthlyRate = interestRate / 12;
        MonthlyAmount = monthlyRate == 0
            ? principal / totalMonths
            : Math.Ceiling(principal * monthlyRate * (decimal)Math.Pow((double)(1 + monthlyRate), totalMonths)
                / ((decimal)Math.Pow((double)(1 + monthlyRate), totalMonths) - 1));

        TotalAmount = downPayment + MonthlyAmount * totalMonths;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return ProductPrice;
        yield return DownPayment;
        yield return TotalMonths;
        yield return InterestRate;
    }
}
