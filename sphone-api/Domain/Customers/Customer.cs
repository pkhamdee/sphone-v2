using SPhone.Domain.Common;
using SPhone.Domain.Customers.Events;

namespace SPhone.Domain.Customers;

public sealed class Customer : AggregateRoot<CustomerId>
{
    public NationalId NationalId { get; private set; }
    public string FullName { get; private set; }
    public PhoneNumber PhoneNumber { get; private set; }
    public DateOnly DateOfBirth { get; private set; }
    public decimal CreditLimit { get; private set; }
    public CustomerStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // EF Core constructor
    private Customer() : base(CustomerId.New())
    {
        NationalId = null!;
        FullName = null!;
        PhoneNumber = null!;
    }

    private Customer(
        CustomerId id,
        NationalId nationalId,
        string fullName,
        PhoneNumber phoneNumber,
        DateOnly dateOfBirth) : base(id)
    {
        NationalId = nationalId;
        FullName = fullName;
        PhoneNumber = phoneNumber;
        DateOfBirth = dateOfBirth;
        CreditLimit = 30_000m; // Default credit limit 30,000 THB
        Status = CustomerStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public static Customer Register(
        NationalId nationalId,
        string fullName,
        PhoneNumber phoneNumber,
        DateOnly dateOfBirth)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("Full name is required.");

        var customer = new Customer(CustomerId.New(), nationalId, fullName, phoneNumber, dateOfBirth);
        customer.RaiseDomainEvent(CustomerRegisteredEvent.Create(customer.Id, nationalId, fullName, phoneNumber));
        return customer;
    }

    public void Verify()
    {
        if (Status != CustomerStatus.Pending)
            throw new DomainException("Only pending customers can be verified.");
        Status = CustomerStatus.Verified;
        CreditLimit = 50_000m; // Increase limit upon verification
    }

    public void Suspend()
    {
        if (Status == CustomerStatus.Suspended)
            throw new DomainException("Customer is already suspended.");
        Status = CustomerStatus.Suspended;
    }
}
