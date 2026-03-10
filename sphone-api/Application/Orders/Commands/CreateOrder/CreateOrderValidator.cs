using FluentValidation;

namespace SPhone.Application.Orders.Commands.CreateOrder;

public sealed class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.DownPayment).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalMonths)
            .Must(m => new[] { 3, 6, 12, 18, 24 }.Contains(m))
            .WithMessage("Total months must be 3, 6, 12, 18, or 24.");
    }
}
