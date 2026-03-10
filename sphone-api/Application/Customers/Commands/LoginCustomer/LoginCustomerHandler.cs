using SPhone.Application.Common;
using SPhone.Domain.Common;
using SPhone.Domain.Customers;
using SPhone.Domain.Customers.Ports;

namespace SPhone.Application.Customers.Commands.LoginCustomer;

public interface IJwtTokenService
{
    string GenerateToken(Guid customerId, string nationalId, string fullName);
}

public sealed class LoginCustomerHandler(
    ICustomerRepository customerRepository,
    IJwtTokenService jwtTokenService) : ICommandHandler<LoginCustomerCommand, LoginCustomerResult>
{
    public async Task<LoginCustomerResult> Handle(LoginCustomerCommand command, CancellationToken cancellationToken)
    {
        var nationalId = new NationalId(command.NationalId);
        var phoneNumber = new PhoneNumber(command.PhoneNumber);

        var customer = await customerRepository.GetByNationalIdAndPhoneAsync(nationalId, phoneNumber, cancellationToken)
            ?? throw new DomainException("Invalid national ID or phone number.");

        if (customer.Status == CustomerStatus.Suspended)
            throw new DomainException("Your account has been suspended. Please contact support.");

        var token = jwtTokenService.GenerateToken(customer.Id.Value, customer.NationalId.Value, customer.FullName);
        return new LoginCustomerResult(token, customer.Id.Value, customer.FullName);
    }
}
