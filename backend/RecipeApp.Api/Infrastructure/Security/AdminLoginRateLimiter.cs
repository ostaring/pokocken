using System.Collections.Concurrent;
using Microsoft.Extensions.Options;

namespace RecipeApp.Api.Infrastructure;

public sealed class AdminLoginRateLimiter
{
    private readonly ConcurrentDictionary<string, LoginWindow> _windows = new();
    private readonly TimeProvider _timeProvider;
    private readonly SecurityRateLimitOptions _options;

    public AdminLoginRateLimiter(TimeProvider timeProvider, IOptions<SecurityRateLimitOptions> options)
    {
        _timeProvider = timeProvider;
        _options = options.Value;
    }

    public bool TryAcquire(HttpContext context)
    {
        var now = _timeProvider.GetUtcNow();
        var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var windowSeconds = Math.Max(1, _options.AdminLoginWindowSeconds);
        var permitLimit = Math.Max(1, _options.AdminLoginPermitLimit);

        var updatedWindow = _windows.AddOrUpdate(
            key,
            _ => new LoginWindow(now.AddSeconds(windowSeconds), 1),
            (_, current) => current.ExpiresAtUtc <= now
                ? new LoginWindow(now.AddSeconds(windowSeconds), 1)
                : current with { Count = current.Count + 1 });

        return updatedWindow.Count <= permitLimit;
    }

    private sealed record LoginWindow(DateTimeOffset ExpiresAtUtc, int Count);
}
