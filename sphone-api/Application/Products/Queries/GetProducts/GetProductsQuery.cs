using SPhone.Application.Common;
using SPhone.Domain.Products;

namespace SPhone.Application.Products.Queries.GetProducts;

public sealed record GetProductsQuery(ProductCategory? Category = null) : IQuery<IReadOnlyList<ProductDto>>;

public sealed record ProductDto(
    Guid Id,
    string Name,
    string Description,
    string Brand,
    string ImageUrl,
    decimal Price,
    string Currency,
    string Category,
    bool IsAvailable);
