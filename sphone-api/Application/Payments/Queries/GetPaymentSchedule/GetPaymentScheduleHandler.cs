using SPhone.Application.Common;
using SPhone.Domain.Common;
using SPhone.Domain.Orders;
using SPhone.Domain.Payments;
using SPhone.Domain.Payments.Ports;

namespace SPhone.Application.Payments.Queries.GetPaymentSchedule;

public sealed class GetPaymentScheduleHandler(
    IPaymentScheduleRepository paymentScheduleRepository,
    ICacheService cache) : IQueryHandler<GetPaymentScheduleQuery, PaymentScheduleDto>
{
    public async Task<PaymentScheduleDto> Handle(GetPaymentScheduleQuery query, CancellationToken cancellationToken)
    {
        var cacheKey = $"schedule:{query.OrderId}";
        var cached = await cache.GetAsync<PaymentScheduleDto>(cacheKey, cancellationToken);
        if (cached is not null) return cached;

        var orderId = new OrderId(query.OrderId);
        var schedule = await paymentScheduleRepository.GetByOrderIdAsync(orderId, cancellationToken)
            ?? throw new NotFoundException(nameof(PaymentSchedule), query.OrderId);

        var dto = new PaymentScheduleDto(
            schedule.Id.Value,
            schedule.OrderId.Value,
            schedule.TotalAmount,
            schedule.TotalMonths,
            schedule.Items.Select(i => new PaymentItemDto(
                i.Id,
                i.InstallmentNumber,
                i.DueDate,
                i.Amount,
                i.Status.ToString(),
                i.PaidAt)).ToList());

        await cache.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(5), cancellationToken);
        return dto;
    }
}
