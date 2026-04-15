namespace RecipeApp.Api.Infrastructure;

public sealed class AdminApiKeyEndpointFilter : IEndpointFilter
{
    private const string HeaderName = "X-Admin-Api-Key";
    private readonly IConfiguration _configuration;

    public AdminApiKeyEndpointFilter(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var configuredApiKey = _configuration["Admin:ApiKey"];
        if (string.IsNullOrWhiteSpace(configuredApiKey))
        {
            return ValueTask.FromResult<object?>(Results.Problem(
                title: "Admin API key is not configured.",
                statusCode: StatusCodes.Status500InternalServerError));
        }

        if (!context.HttpContext.Request.Headers.TryGetValue(HeaderName, out var providedApiKey) ||
            !string.Equals(providedApiKey.ToString(), configuredApiKey, StringComparison.Ordinal))
        {
            return ValueTask.FromResult<object?>(Results.Unauthorized());
        }

        return next(context);
    }
}
