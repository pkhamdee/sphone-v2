using MediatR;
using SPhone.Application.Payments.Queries.GetPaymentSchedule;

namespace SPhone.API.Endpoints;

public static class PaymentEndpoints
{
    public static void MapPaymentEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/payments").WithTags("Payments").RequireAuthorization();

        group.MapGet("/schedule/{orderId:guid}", async (Guid orderId, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetPaymentScheduleQuery(orderId), ct);
            return Results.Ok(result);
        })
        .WithName("GetPaymentSchedule")
        .WithSummary("Get the installment payment schedule for an order");
    }
}
