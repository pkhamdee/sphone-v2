using SPhone.Application.Common;

namespace SPhone.Application.Customers.Commands.RegisterCustomer;

public sealed record RegisterCustomerCommand(
    string NationalId,
    string FullName,
    string PhoneNumber,
    DateOnly DateOfBirth) : ICommand<RegisterCustomerResult>;

public sealed record RegisterCustomerResult(Guid CustomerId, string FullName);
