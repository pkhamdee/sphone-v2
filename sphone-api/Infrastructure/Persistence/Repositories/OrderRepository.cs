using Microsoft.EntityFrameworkCore;
using SPhone.Domain.Customers;
using SPhone.Domain.Orders;
using SPhone.Domain.Orders.Ports;

namespace SPhone.Infrastructure.Persistence.Repositories;

public class OrderRepository(SPhoneDbContext db) : IOrderRepository
{
    public Task<Order?> GetByIdAsync(OrderId id, CancellationToken ct = default) =>
        db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Order>> GetByCustomerIdAsync(CustomerId customerId, CancellationToken ct = default) =>
        await db.Orders.Where(o => o.CustomerId == customerId).OrderByDescending(o => o.CreatedAt).ToListAsync(ct);

    public async Task AddAsync(Order order, CancellationToken ct = default) =>
        await db.Orders.AddAsync(order, ct);

    public void Update(Order order) => db.Orders.Update(order);
}
