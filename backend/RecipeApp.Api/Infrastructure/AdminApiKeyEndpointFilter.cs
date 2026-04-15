namespace RecipeApp.Api.Infrastructure;

public sealed class AdminApiKeyEndpointFilter : IEndpointFilter
{
    private readonly IConfiguration _configuration;
    private readonly AdminSessionStore _sessionStore;

    public AdminApiKeyEndpointFilter(IConfiguration configuration, AdminSessionStore sessionStore)
    {
        _configuration = configuration;
        _sessionStore = sessionStore;
    }

    public ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var sessionId = context.HttpContext.Request.Cookies[AdminAuthConstants.SessionCookieName];
        if (_sessionStore.GetSession(sessionId) is not null)
        {
            return next(context);
        }

        var configuredApiKey = _configuration["Admin:ApiKey"];
        if (string.IsNullOrWhiteSpace(configuredApiKey))
        {
            return ValueTask.FromResult<object?>(Results.Problem(
                title: "Admin authentication is not configured.",
                statusCode: StatusCodes.Status500InternalServerError));
        }

        if (!context.HttpContext.Request.Headers.TryGetValue(AdminAuthConstants.ApiKeyHeaderName, out var providedApiKey) ||
            !string.Equals(providedApiKey.ToString(), configuredApiKey, StringComparison.Ordinal))
        {
            return ValueTask.FromResult<object?>(Results.Unauthorized());
        }

        return next(context);
    }
}
