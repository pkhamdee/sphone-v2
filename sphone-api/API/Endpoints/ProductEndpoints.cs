using MediatR;
using SPhone.Application.Products.Queries.GetProductById;
using SPhone.Application.Products.Queries.GetProducts;
using SPhone.Domain.Products;

namespace SPhone.API.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", async (string? category, IMediator mediator, CancellationToken ct) =>
        {
            ProductCategory? cat = null;
            if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<ProductCategory>(category, true, out var parsed))
                cat = parsed;

            var result = await mediator.Send(new GetProductsQuery(cat), ct);
            return Results.Ok(result);
        })
        .WithName("GetProducts")
        .WithSummary("Get all available products, optionally filtered by category");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetProductByIdQuery(id), ct);
            return Results.Ok(result);
        })
        .WithName("GetProductById")
        .WithSummary("Get a product by ID");
    }
}
