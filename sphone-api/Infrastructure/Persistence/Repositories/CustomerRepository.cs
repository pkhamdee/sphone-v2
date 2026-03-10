using Microsoft.EntityFrameworkCore;
using SPhone.Domain.Customers;
using SPhone.Domain.Customers.Ports;

namespace SPhone.Infrastructure.Persistence.Repositories;

public class CustomerRepository(SPhoneDbContext db) : ICustomerRepository
{
    public Task<Customer?> GetByIdAsync(CustomerId id, CancellationToken ct = default) =>
        db.Customers.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<Customer?> GetByNationalIdAsync(NationalId nationalId, CancellationToken ct = default) =>
        db.Customers.FirstOrDefaultAsync(c => c.NationalId == nationalId, ct);

    public Task<Customer?> GetByNationalIdAndPhoneAsync(NationalId nationalId, PhoneNumber phoneNumber, CancellationToken ct = default) =>
        db.Customers.FirstOrDefaultAsync(c => c.NationalId == nationalId && c.PhoneNumber == phoneNumber, ct);

    public async Task AddAsync(Customer customer, CancellationToken ct = default) =>
        await db.Customers.AddAsync(customer, ct);

    public void Update(Customer customer) => db.Customers.Update(customer);

    public Task<bool> ExistsByNationalIdAsync(NationalId nationalId, CancellationToken ct = default) =>
        db.Customers.AnyAsync(c => c.NationalId == nationalId, ct);
}
