using SPhone.Application.Common;
using SPhone.Application.Products.Queries.GetProducts;

namespace SPhone.Application.Products.Queries.GetProductById;

public sealed record GetProductByIdQuery(Guid ProductId) : IQuery<ProductDto>;
