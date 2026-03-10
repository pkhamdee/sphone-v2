using SPhone.Application.Common;

namespace SPhone.Application.Customers.Commands.LoginCustomer;

public sealed record LoginCustomerCommand(
    string NationalId,
    string PhoneNumber) : ICommand<LoginCustomerResult>;

public sealed record LoginCustomerResult(string Token, Guid CustomerId, string FullName);
