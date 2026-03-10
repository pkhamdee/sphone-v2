using SPhone.Application.Common;

namespace SPhone.Application.Payments.Queries.GetPaymentSchedule;

public sealed record GetPaymentScheduleQuery(Guid OrderId) : IQuery<PaymentScheduleDto>;

public sealed record PaymentScheduleDto(
    Guid ScheduleId,
    Guid OrderId,
    decimal TotalAmount,
    int TotalMonths,
    IReadOnlyList<PaymentItemDto> Items);

public sealed record PaymentItemDto(
    Guid Id,
    int InstallmentNumber,
    DateOnly DueDate,
    decimal Amount,
    string Status,
    DateTime? PaidAt);
