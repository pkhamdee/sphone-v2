using Microsoft.EntityFrameworkCore;
using SPhone.Domain.Orders;
using SPhone.Domain.Payments;
using SPhone.Domain.Payments.Ports;

namespace SPhone.Infrastructure.Persistence.Repositories;

public class PaymentScheduleRepository(SPhoneDbContext db) : IPaymentScheduleRepository
{
    public Task<PaymentSchedule?> GetByIdAsync(PaymentScheduleId id, CancellationToken ct = default) =>
        db.PaymentSchedules.Include(s => s.Items).FirstOrDefaultAsync(s => s.Id == id, ct);

    public Task<PaymentSchedule?> GetByOrderIdAsync(OrderId orderId, CancellationToken ct = default) =>
        db.PaymentSchedules.Include(s => s.Items).OrderBy(i => i.Id).FirstOrDefaultAsync(s => s.OrderId == orderId, ct);

    public async Task AddAsync(PaymentSchedule schedule, CancellationToken ct = default) =>
        await db.PaymentSchedules.AddAsync(schedule, ct);

    public void Update(PaymentSchedule schedule) => db.PaymentSchedules.Update(schedule);
}
