using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using SPhone.Application.Common;

namespace SPhone.Infrastructure.Observability;

public static class ObservabilityExtensions
{

    public static IServiceCollection AddObservability(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var otlpEndpoint = configuration["OpenTelemetry:Endpoint"] ?? "http://localhost:4317";
        var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Development";

        var resourceBuilder = ResourceBuilder.CreateDefault()
            .AddService(
                serviceName: SPhoneMetrics.ServiceName,
                serviceVersion: "1.0.0")
            .AddAttributes(new Dictionary<string, object>
            {
                ["deployment.environment"] = environment,
                ["service.namespace"] = "sphone",
            });

        services.AddOpenTelemetry()
            .WithTracing(tracing => tracing
                .SetResourceBuilder(resourceBuilder)
                .AddSource(SPhoneMetrics.ServiceName)
                .AddAspNetCoreInstrumentation(opts =>
                {
                    opts.Filter = ctx =>
                        ctx.Request.Path != "/metrics" &&
                        ctx.Request.Path != "/health" &&
                        ctx.Request.Path != "/favicon.ico";
                    opts.RecordException = true;
                })
                .AddHttpClientInstrumentation(opts =>
                {
                    opts.RecordException = true;
                })
                .AddEntityFrameworkCoreInstrumentation(opts =>
                {
                    opts.SetDbStatementForText = true;
                    opts.SetDbStatementForStoredProcedure = true;
                })
                .AddRedisInstrumentation()
                .AddOtlpExporter(opts =>
                {
                    opts.Endpoint = new Uri(otlpEndpoint);
                }))
            .WithMetrics(metrics => metrics
                .SetResourceBuilder(resourceBuilder)
                .AddMeter(SPhoneMetrics.ServiceName)
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation()
                .AddPrometheusExporter()
                .AddOtlpExporter(opts =>
                {
                    opts.Endpoint = new Uri(otlpEndpoint);
                }));

        return services;
    }

    public static ILoggingBuilder AddObservabilityLogging(
        this ILoggingBuilder logging,
        IConfiguration configuration)
    {
        var otlpEndpoint = configuration["OpenTelemetry:Endpoint"] ?? "http://localhost:4317";

        logging.AddOpenTelemetry(opts =>
        {
            opts.SetResourceBuilder(ResourceBuilder.CreateDefault()
                .AddService(SPhoneMetrics.ServiceName));
            opts.IncludeFormattedMessage = true;
            opts.IncludeScopes = true;
            opts.ParseStateValues = true;
            opts.AddOtlpExporter(otlp =>
            {
                otlp.Endpoint = new Uri(otlpEndpoint);
            });
        });

        return logging;
    }

    public static IApplicationBuilder UseObservability(this IApplicationBuilder app)
    {
        app.UseOpenTelemetryPrometheusScrapingEndpoint();
        return app;
    }
}
