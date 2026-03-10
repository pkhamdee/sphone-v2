using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SPhone.Domain.Customers;

namespace SPhone.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasConversion(id => id.Value, value => new CustomerId(value))
            .HasColumnName("id");

        builder.Property(c => c.FullName)
            .HasMaxLength(200)
            .HasColumnName("full_name");

        builder.ComplexProperty(c => c.NationalId, nb =>
        {
            nb.Property(n => n.Value)
                .HasMaxLength(13)
                .HasColumnName("national_id")
                .IsRequired();
        });

        builder.ComplexProperty(c => c.PhoneNumber, pb =>
        {
            pb.Property(p => p.Value)
                .HasMaxLength(10)
                .HasColumnName("phone_number")
                .IsRequired();
        });

        builder.Property(c => c.DateOfBirth).HasColumnName("date_of_birth");
        builder.Property(c => c.CreditLimit).HasColumnName("credit_limit").HasPrecision(18, 2);
        builder.Property(c => c.Status).HasColumnName("status").HasConversion<string>();
        builder.Property(c => c.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(c => c.Id).IsUnique();
    }
}
