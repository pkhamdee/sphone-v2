using SPhone.Application.Common;
using SPhone.Application.Products.Queries.GetProducts;
using SPhone.Domain.Common;
using SPhone.Domain.Products;
using SPhone.Domain.Products.Ports;

namespace SPhone.Application.Products.Queries.GetProductById;

public sealed class GetProductByIdHandler(
    IProductRepository productRepository,
    ICacheService cache) : IQueryHandler<GetProductByIdQuery, ProductDto>
{
    public async Task<ProductDto> Handle(GetProductByIdQuery query, CancellationToken cancellationToken)
    {
        var cacheKey = $"product:{query.ProductId}";
        var cached = await cache.GetAsync<ProductDto>(cacheKey, cancellationToken);
        if (cached is not null) return cached;

        var productId = new ProductId(query.ProductId);
        var product = await productRepository.GetByIdAsync(productId, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), query.ProductId);

        var dto = new ProductDto(
            product.Id.Value,
            product.Name,
            product.Description,
            product.Brand,
            product.ImageUrl,
            product.Price.Amount,
            product.Price.Currency,
            product.Category.ToString(),
            product.IsAvailable);

        await cache.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(30), cancellationToken);
        return dto;
    }
}
