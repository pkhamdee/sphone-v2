using Microsoft.EntityFrameworkCore;
using SPhone.Domain.Products;
using SPhone.Domain.Products.Ports;

namespace SPhone.Infrastructure.Persistence.Repositories;

public class ProductRepository(SPhoneDbContext db) : IProductRepository
{
    public Task<Product?> GetByIdAsync(ProductId id, CancellationToken ct = default) =>
        db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<Product>> GetAllAsync(ProductCategory? category = null, CancellationToken ct = default)
    {
        var query = db.Products.Where(p => p.IsAvailable);
        if (category.HasValue) query = query.Where(p => p.Category == category.Value);
        return await query.OrderBy(p => p.Name).ToListAsync(ct);
    }

    public async Task AddAsync(Product product, CancellationToken ct = default) =>
        await db.Products.AddAsync(product, ct);

    public void Update(Product product) => db.Products.Update(product);
}
