using SPhone.Application.Common;
using SPhone.Domain.Common;
using SPhone.Domain.Customers;
using SPhone.Domain.Customers.Ports;

namespace SPhone.Application.Customers.Queries.GetCustomerProfile;

public sealed class GetCustomerProfileHandler(
    ICustomerRepository customerRepository,
    ICacheService cache) : IQueryHandler<GetCustomerProfileQuery, CustomerProfileDto>
{
    public async Task<CustomerProfileDto> Handle(GetCustomerProfileQuery query, CancellationToken cancellationToken)
    {
        var cacheKey = $"customer:{query.CustomerId}";
        var cached = await cache.GetAsync<CustomerProfileDto>(cacheKey, cancellationToken);
        if (cached is not null) return cached;

        var id = new CustomerId(query.CustomerId);
        var customer = await customerRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), query.CustomerId);

        var dto = new CustomerProfileDto(
            customer.Id.Value,
            customer.FullName,
            customer.NationalId.Value,
            customer.PhoneNumber.Value,
            customer.CreditLimit,
            customer.Status.ToString(),
            customer.CreatedAt);

        await cache.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(10), cancellationToken);
        return dto;
    }
}
