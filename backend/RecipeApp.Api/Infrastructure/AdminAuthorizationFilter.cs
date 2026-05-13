using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace RecipeApp.Api.Infrastructure;

public sealed class AdminAuthorizationFilter : IAsyncAuthorizationFilter
{
    private readonly AdminAuthOptions _options;
    private readonly AdminSessionStore _sessionStore;
    private readonly ILogger<AdminAuthorizationFilter> _logger;

    public AdminAuthorizationFilter(
        IOptions<AdminAuthOptions> options,
        AdminSessionStore sessionStore,
        ILogger<AdminAuthorizationFilter> logger)
    {
        _options = options.Value;
        _sessionStore = sessionStore;
        _logger = logger;
    }

    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var path = context.HttpContext.Request.Path;
        var sessionId = context.HttpContext.Request.Cookies[AdminAuthConstants.SessionCookieName];
        if (_sessionStore.GetSession(sessionId) is not null)
        {
            return Task.CompletedTask;
        }

        if (!_options.AllowApiKeyFallback)
        {
            _logger.LogWarning("Rejected admin request to {RequestPath} because no valid admin session was present", path);
            context.Result = new UnauthorizedResult();
            return Task.CompletedTask;
        }

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogError(
                "Admin API key fallback is enabled but no API key is configured for request path {RequestPath}",
                path);
            context.Result = new ObjectResult(new ProblemDetails
            {
                Title = "Admin authentication is not configured.",
                Status = StatusCodes.Status500InternalServerError
            })
            {
                StatusCode = StatusCodes.Status500InternalServerError
            };
            return Task.CompletedTask;
        }

        if (!context.HttpContext.Request.Headers.TryGetValue(AdminAuthConstants.ApiKeyHeaderName, out var providedApiKey) ||
            !string.Equals(providedApiKey.ToString(), _options.ApiKey, StringComparison.Ordinal))
        {
            _logger.LogWarning("Rejected admin request to {RequestPath} because API key authentication failed", path);
            context.Result = new UnauthorizedResult();
            return Task.CompletedTask;
        }

        _logger.LogInformation("Authorized admin request to {RequestPath} via API key fallback", path);
        return Task.CompletedTask;
    }
}
