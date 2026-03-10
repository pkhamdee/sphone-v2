using SPhone.Domain.Common;

namespace SPhone.Domain.Products;

public sealed class Product : AggregateRoot<ProductId>
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public string Brand { get; private set; }
    public string ImageUrl { get; private set; }
    public Money Price { get; private set; }
    public ProductCategory Category { get; private set; }
    public bool IsAvailable { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // EF Core constructor
    private Product() : base(ProductId.New())
    {
        Name = null!;
        Description = null!;
        Brand = null!;
        ImageUrl = null!;
        Price = null!;
    }

    private Product(
        ProductId id,
        string name,
        string description,
        string brand,
        string imageUrl,
        Money price,
        ProductCategory category) : base(id)
    {
        Name = name;
        Description = description;
        Brand = brand;
        ImageUrl = imageUrl;
        Price = price;
        Category = category;
        IsAvailable = true;
        CreatedAt = DateTime.UtcNow;
    }

    public static Product Create(
        string name,
        string description,
        string brand,
        string imageUrl,
        Money price,
        ProductCategory category)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Product name is required.");
        if (string.IsNullOrWhiteSpace(brand)) throw new DomainException("Brand is required.");
        return new Product(ProductId.New(), name, description, brand, imageUrl, price, category);
    }

    public void SetAvailability(bool isAvailable) => IsAvailable = isAvailable;

    public void UpdatePrice(Money newPrice) => Price = newPrice;
}
