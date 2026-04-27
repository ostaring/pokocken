namespace RecipeApp.Api.Infrastructure;

public sealed class AdminApiKeyEndpointFilter : IEndpointFilter
{
    private readonly AdminAuthOptions _options;
    private readonly AdminSessionStore _sessionStore;

    public AdminApiKeyEndpointFilter(Microsoft.Extensions.Options.IOptions<AdminAuthOptions> options, AdminSessionStore sessionStore)
    {
        _options = options.Value;
        _sessionStore = sessionStore;
    }

    public ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var sessionId = context.HttpContext.Request.Cookies[AdminAuthConstants.SessionCookieName];
        if (_sessionStore.GetSession(sessionId) is not null)
        {
            return next(context);
        }

        if (!_options.AllowApiKeyFallback)
        {
            return ValueTask.FromResult<object?>(Results.Unauthorized());
        }

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            return ValueTask.FromResult<object?>(Results.Problem(
                title: "Admin authentication is not configured.",
                statusCode: StatusCodes.Status500InternalServerError));
        }

        if (!context.HttpContext.Request.Headers.TryGetValue(AdminAuthConstants.ApiKeyHeaderName, out var providedApiKey) ||
            !string.Equals(providedApiKey.ToString(), _options.ApiKey, StringComparison.Ordinal))
        {
            return ValueTask.FromResult<object?>(Results.Unauthorized());
        }

        return next(context);
    }
}
