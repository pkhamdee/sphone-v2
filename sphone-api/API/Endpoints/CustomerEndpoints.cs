using System.Security.Claims;
using MediatR;
using SPhone.Application.Customers.Queries.GetCustomerProfile;

namespace SPhone.API.Endpoints;

public static class CustomerEndpoints
{
    public static void MapCustomerEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/customers").WithTags("Customers").RequireAuthorization();

        group.MapGet("/me", async (ClaimsPrincipal user, IMediator mediator, CancellationToken ct) =>
        {
            var customerId = Guid.Parse(user.FindFirstValue("customerId")!);
            var result = await mediator.Send(new GetCustomerProfileQuery(customerId), ct);
            return Results.Ok(result);
        })
        .WithName("GetMyProfile")
        .WithSummary("Get current customer profile");
    }
}
