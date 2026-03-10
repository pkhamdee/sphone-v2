namespace SPhone.Domain.Customers.Ports;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(CustomerId id, CancellationToken ct = default);
    Task<Customer?> GetByNationalIdAsync(NationalId nationalId, CancellationToken ct = default);
    Task<Customer?> GetByNationalIdAndPhoneAsync(NationalId nationalId, PhoneNumber phoneNumber, CancellationToken ct = default);
    Task AddAsync(Customer customer, CancellationToken ct = default);
    void Update(Customer customer);
    Task<bool> ExistsByNationalIdAsync(NationalId nationalId, CancellationToken ct = default);
}
