using MediatR;
using SPhone.Application.Customers.Commands.LoginCustomer;
using SPhone.Application.Customers.Commands.RegisterCustomer;

namespace SPhone.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterCustomerCommand command, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(command, ct);
            return Results.Created($"/api/customers/{result.CustomerId}", result);
        })
        .WithName("RegisterCustomer")
        .WithSummary("Register a new customer with national ID");

        group.MapPost("/login", async (LoginCustomerCommand command, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(command, ct);
            return Results.Ok(result);
        })
        .WithName("LoginCustomer")
        .WithSummary("Login with national ID and phone number");
    }
}
