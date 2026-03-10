using SPhone.Application.Common;

namespace SPhone.Application.Customers.Queries.GetCustomerProfile;

public sealed record GetCustomerProfileQuery(Guid CustomerId) : IQuery<CustomerProfileDto>;

public sealed record CustomerProfileDto(
    Guid Id,
    string FullName,
    string NationalId,
    string PhoneNumber,
    decimal CreditLimit,
    string Status,
    DateTime CreatedAt);
