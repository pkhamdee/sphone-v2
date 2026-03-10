using SPhone.Domain.Orders;

namespace SPhone.Domain.Payments.Ports;

public interface IPaymentScheduleRepository
{
    Task<PaymentSchedule?> GetByIdAsync(PaymentScheduleId id, CancellationToken ct = default);
    Task<PaymentSchedule?> GetByOrderIdAsync(OrderId orderId, CancellationToken ct = default);
    Task AddAsync(PaymentSchedule schedule, CancellationToken ct = default);
    void Update(PaymentSchedule schedule);
}
