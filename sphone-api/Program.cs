using System.Text;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SPhone.API.Endpoints;
using SPhone.API.Middleware;
using SPhone.Application.Common.Behaviors;
using Microsoft.EntityFrameworkCore;
using SPhone.Infrastructure;
using SPhone.Infrastructure.Observability;
using SPhone.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Observability: OTel traces + metrics + OTLP logs
builder.Services.AddObservability(builder.Configuration);
builder.Logging.AddObservabilityLogging(builder.Configuration);

// API Explorer & Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "sPhone API", Version = "v1" });
});

// CORS — allow both local dev and containerised frontend
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000", "http://sphone-app:3000"];

builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()));

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });
builder.Services.AddAuthorization();

// MediatR + Validation Pipeline
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(SPhone.Application.Common.ICommand<>).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(SPhone.Application.Common.ICommand<>).Assembly);
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// Infrastructure (DB, Redis, Kafka, etc.)
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Apply EF Core migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SPhoneDbContext>();
    await db.Database.MigrateAsync();
    await SeedData.SeedAsync(db);
}

// Observability: expose /metrics scrape endpoint for Prometheus
app.UseObservability();

// Health check
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "sphone-api" }));

// Middleware
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "sPhone API v1"));
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Map all endpoints
app.MapAuthEndpoints();
app.MapCustomerEndpoints();
app.MapProductEndpoints();
app.MapOrderEndpoints();
app.MapPaymentEndpoints();

app.Run();
