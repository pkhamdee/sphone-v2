using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SPhone.Domain.Products;

namespace SPhone.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasConversion(id => id.Value, value => new ProductId(value))
            .HasColumnName("id");

        builder.Property(p => p.Name).HasMaxLength(200).HasColumnName("name");
        builder.Property(p => p.Description).HasMaxLength(2000).HasColumnName("description");
        builder.Property(p => p.Brand).HasMaxLength(100).HasColumnName("brand");
        builder.Property(p => p.ImageUrl).HasMaxLength(500).HasColumnName("image_url");

        builder.ComplexProperty(p => p.Price, mb =>
        {
            mb.Property(m => m.Amount).HasColumnName("price").HasPrecision(18, 2);
            mb.Property(m => m.Currency).HasMaxLength(3).HasColumnName("currency");
        });

        builder.Property(p => p.Category).HasColumnName("category").HasConversion<string>();
        builder.Property(p => p.IsAvailable).HasColumnName("is_available");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
    }
}
