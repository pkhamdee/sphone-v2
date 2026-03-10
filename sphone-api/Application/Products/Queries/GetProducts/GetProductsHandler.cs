using SPhone.Application.Common;
using SPhone.Domain.Products.Ports;

namespace SPhone.Application.Products.Queries.GetProducts;

public sealed class GetProductsHandler(
    IProductRepository productRepository,
    ICacheService cache) : IQueryHandler<GetProductsQuery, IReadOnlyList<ProductDto>>
{
    public async Task<IReadOnlyList<ProductDto>> Handle(GetProductsQuery query, CancellationToken cancellationToken)
    {
        var cacheKey = $"products:{query.Category?.ToString() ?? "all"}";
        var cached = await cache.GetAsync<List<ProductDto>>(cacheKey, cancellationToken);
        if (cached is not null) return cached;

        var products = await productRepository.GetAllAsync(query.Category, cancellationToken);
        var dtos = products.Select(p => new ProductDto(
            p.Id.Value,
            p.Name,
            p.Description,
            p.Brand,
            p.ImageUrl,
            p.Price.Amount,
            p.Price.Currency,
            p.Category.ToString(),
            p.IsAvailable)).ToList();

        await cache.SetAsync(cacheKey, dtos, TimeSpan.FromMinutes(30), cancellationToken);
        return dtos;
    }
}
