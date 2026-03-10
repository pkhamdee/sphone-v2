using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SPhone.Domain.Customers;
using SPhone.Domain.Orders;
using SPhone.Domain.Products;

namespace SPhone.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .HasConversion(id => id.Value, value => new OrderId(value))
            .HasColumnName("id");

        builder.Property(o => o.CustomerId)
            .HasConversion(id => id.Value, value => new CustomerId(value))
            .HasColumnName("customer_id");

        builder.Property(o => o.ProductId)
            .HasConversion(id => id.Value, value => new ProductId(value))
            .HasColumnName("product_id");

        builder.Property(o => o.ProductName).HasMaxLength(200).HasColumnName("product_name");

        builder.ComplexProperty(o => o.InstallmentPlan, pb =>
        {
            pb.Property(p => p.ProductPrice).HasColumnName("product_price").HasPrecision(18, 2);
            pb.Property(p => p.DownPayment).HasColumnName("down_payment").HasPrecision(18, 2);
            pb.Property(p => p.TotalMonths).HasColumnName("total_months");
            pb.Property(p => p.InterestRate).HasColumnName("interest_rate").HasPrecision(5, 4);
            pb.Property(p => p.MonthlyAmount).HasColumnName("monthly_amount").HasPrecision(18, 2);
            pb.Property(p => p.TotalAmount).HasColumnName("total_amount").HasPrecision(18, 2);
        });

        builder.Property(o => o.Status).HasColumnName("status").HasConversion<string>();
        builder.Property(o => o.CreatedAt).HasColumnName("created_at");
        builder.Property(o => o.ApprovedAt).HasColumnName("approved_at");

        builder.HasIndex(o => o.CustomerId).HasDatabaseName("ix_orders_customer_id");
    }
}
