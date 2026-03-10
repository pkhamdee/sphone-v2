using FluentValidation;

namespace SPhone.Application.Customers.Commands.RegisterCustomer;

public sealed class RegisterCustomerValidator : AbstractValidator<RegisterCustomerCommand>
{
    public RegisterCustomerValidator()
    {
        RuleFor(x => x.NationalId)
            .NotEmpty().WithMessage("National ID is required.")
            .Matches(@"^\d{13}$").WithMessage("National ID must be exactly 13 digits.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(200).WithMessage("Full name cannot exceed 200 characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches(@"^0[689]\d{8}$").WithMessage("Phone number must be a valid Thai mobile number.");

        RuleFor(x => x.DateOfBirth)
            .Must(dob => dob <= DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-20)))
            .WithMessage("Customer must be at least 20 years old.")
            .Must(dob => dob >= DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-70)))
            .WithMessage("Customer age cannot exceed 70 years.");
    }
}
