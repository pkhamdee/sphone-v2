using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using SPhone.Application.Common;
using SPhone.Application.Customers.Commands.LoginCustomer;
using SPhone.Domain.Customers.Ports;
using SPhone.Domain.Orders.Ports;
using SPhone.Domain.Payments.Ports;
using SPhone.Domain.Products.Ports;
using SPhone.Infrastructure.Auth;
using SPhone.Infrastructure.Cache;
using SPhone.Infrastructure.Messaging;
using SPhone.Infrastructure.Persistence;
using SPhone.Infrastructure.Persistence.Repositories;

namespace SPhone.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<SPhoneDbContext>(opts =>
            opts.UseNpgsql(configuration.GetConnectionString("Database"))
                .UseSnakeCaseNamingConvention());

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<SPhoneDbContext>());

        // Repositories
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IPaymentScheduleRepository, PaymentScheduleRepository>();

        // Redis
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var connStr = configuration.GetConnectionString("Redis") ?? "localhost:6379";
            return ConnectionMultiplexer.Connect(connStr);
        });
        services.AddScoped<ICacheService, RedisCacheService>();

        // Kafka
        services.AddSingleton<IEventBus, KafkaEventBus>();

        // Auth
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        return services;
    }
}
