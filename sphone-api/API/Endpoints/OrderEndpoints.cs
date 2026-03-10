using System.Security.Claims;
using MediatR;
using SPhone.Application.Orders.Commands.CreateOrder;
using SPhone.Application.Orders.Queries.GetMyOrders;

namespace SPhone.API.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/orders").WithTags("Orders").RequireAuthorization();

        group.MapPost("/", async (CreateOrderRequest request, ClaimsPrincipal user, IMediator mediator, CancellationToken ct) =>
        {
            var customerId = Guid.Parse(user.FindFirstValue("customerId")!);
            var command = new CreateOrderCommand(customerId, request.ProductId, request.DownPayment, request.TotalMonths);
            var result = await mediator.Send(command, ct);
            return Results.Created($"/api/orders/{result.OrderId}", result);
        })
        .WithName("CreateOrder")
        .WithSummary("Create an installment order for a product");

        group.MapGet("/my", async (ClaimsPrincipal user, IMediator mediator, CancellationToken ct) =>
        {
            var customerId = Guid.Parse(user.FindFirstValue("customerId")!);
            var result = await mediator.Send(new GetMyOrdersQuery(customerId), ct);
            return Results.Ok(result);
        })
        .WithName("GetMyOrders")
        .WithSummary("Get all orders for the current customer");
    }
}

public record CreateOrderRequest(Guid ProductId, decimal DownPayment, int TotalMonths);
