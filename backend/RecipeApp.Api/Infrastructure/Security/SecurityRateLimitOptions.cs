namespace RecipeApp.Api.Infrastructure;

public sealed class SecurityRateLimitOptions
{
    public int AdminLoginPermitLimit { get; init; } = 5;
    public int AdminLoginWindowSeconds { get; init; } = 60;
    public int AdminApiPermitLimit { get; init; } = 120;
}
