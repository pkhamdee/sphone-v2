using System.Net;
using System.Text.Json;
using FluentValidation;
using SPhone.Domain.Common;

namespace SPhone.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (status, title, detail) = ex switch
        {
            ValidationException ve => (HttpStatusCode.BadRequest, "Validation Error",
                string.Join("; ", ve.Errors.Select(e => e.ErrorMessage))),
            DomainException de => (HttpStatusCode.BadRequest, "Business Rule Violation", de.Message),
            NotFoundException nfe => (HttpStatusCode.NotFound, "Not Found", nfe.Message),
            _ => (HttpStatusCode.InternalServerError, "Internal Server Error", "An unexpected error occurred.")
        };

        context.Response.StatusCode = (int)status;
        context.Response.ContentType = "application/problem+json";

        var problem = new
        {
            type = $"https://httpstatuses.io/{(int)status}",
            title,
            status = (int)status,
            detail,
            instance = context.Request.Path.Value
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
