using Microsoft.EntityFrameworkCore;
using SPhone.Application.Common;
using SPhone.Domain.Customers;
using SPhone.Domain.Orders;
using SPhone.Domain.Payments;
using SPhone.Domain.Products;

namespace SPhone.Infrastructure.Persistence;

public class SPhoneDbContext(DbContextOptions<SPhoneDbContext> options) : DbContext(options), IUnitOfWork
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<PaymentSchedule> PaymentSchedules => Set<PaymentSchedule>();
    public DbSet<PaymentItem> PaymentItems => Set<PaymentItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SPhoneDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
