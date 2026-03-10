using SPhone.Application.Common;
using SPhone.Domain.Common;
using SPhone.Domain.Customers;
using SPhone.Domain.Customers.Ports;

namespace SPhone.Application.Customers.Commands.RegisterCustomer;

public sealed class RegisterCustomerHandler(
    ICustomerRepository customerRepository,
    IUnitOfWork unitOfWork,
    IEventBus eventBus) : ICommandHandler<RegisterCustomerCommand, RegisterCustomerResult>
{
    public async Task<RegisterCustomerResult> Handle(RegisterCustomerCommand command, CancellationToken cancellationToken)
    {
        var nationalId = new NationalId(command.NationalId);
        var phoneNumber = new PhoneNumber(command.PhoneNumber);

        if (await customerRepository.ExistsByNationalIdAsync(nationalId, cancellationToken))
            throw new DomainException("A customer with this National ID already exists.");

        var customer = Customer.Register(nationalId, command.FullName, phoneNumber, command.DateOfBirth);
        await customerRepository.AddAsync(customer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var domainEvent in customer.PopDomainEvents())
            await eventBus.PublishAsync(domainEvent, cancellationToken);

        SPhoneMetrics.CustomersRegistered.Add(1);

        return new RegisterCustomerResult(customer.Id.Value, customer.FullName);
    }
}
