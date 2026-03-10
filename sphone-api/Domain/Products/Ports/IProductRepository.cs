namespace SPhone.Domain.Products.Ports;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(ProductId id, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> GetAllAsync(ProductCategory? category = null, CancellationToken ct = default);
    Task AddAsync(Product product, CancellationToken ct = default);
    void Update(Product product);
}
