using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SPhone.Domain.Orders;
using SPhone.Domain.Payments;

namespace SPhone.Infrastructure.Persistence.Configurations;

public class PaymentScheduleConfiguration : IEntityTypeConfiguration<PaymentSchedule>
{
    public void Configure(EntityTypeBuilder<PaymentSchedule> builder)
    {
        builder.ToTable("payment_schedules");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasConversion(id => id.Value, value => new PaymentScheduleId(value))
            .HasColumnName("id");

        builder.Property(p => p.OrderId)
            .HasConversion(id => id.Value, value => new OrderId(value))
            .HasColumnName("order_id");

        builder.Property(p => p.TotalAmount).HasColumnName("total_amount").HasPrecision(18, 2);
        builder.Property(p => p.TotalMonths).HasColumnName("total_months");

        builder.HasMany(p => p.Items)
            .WithOne()
            .HasForeignKey(i => i.PaymentScheduleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.OrderId).IsUnique().HasDatabaseName("ix_payment_schedules_order_id");
    }
}

public class PaymentItemConfiguration : IEntityTypeConfiguration<PaymentItem>
{
    public void Configure(EntityTypeBuilder<PaymentItem> builder)
    {
        builder.ToTable("payment_items");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).HasColumnName("id");
        builder.Property(i => i.PaymentScheduleId)
            .HasConversion(id => id.Value, value => new PaymentScheduleId(value))
            .HasColumnName("payment_schedule_id");
        builder.Property(i => i.InstallmentNumber).HasColumnName("installment_number");
        builder.Property(i => i.DueDate).HasColumnName("due_date");
        builder.Property(i => i.Amount).HasColumnName("amount").HasPrecision(18, 2);
        builder.Property(i => i.Status).HasColumnName("status").HasConversion<string>();
        builder.Property(i => i.PaidAt).HasColumnName("paid_at");
    }
}
