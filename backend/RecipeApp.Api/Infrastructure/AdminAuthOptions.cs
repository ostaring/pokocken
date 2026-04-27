namespace RecipeApp.Api.Infrastructure;

public sealed class AdminAuthOptions
{
    public string ApiKey { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public bool AllowApiKeyFallback { get; init; }
    public int SessionDurationHours { get; init; } = 24 * 7;
}
