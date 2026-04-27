using System.Collections.Concurrent;
using Microsoft.Extensions.Options;

namespace RecipeApp.Api.Infrastructure;

public sealed class AdminSessionStore
{
    private readonly ConcurrentDictionary<string, AdminSession> _sessions = new();
    private readonly TimeProvider _timeProvider;
    private readonly AdminAuthOptions _options;

    public AdminSessionStore(TimeProvider timeProvider, IOptions<AdminAuthOptions> options)
    {
        _timeProvider = timeProvider;
        _options = options.Value;
    }

    public AdminSession CreateSession(string username)
    {
        var expiresAtUtc = _timeProvider.GetUtcNow().AddHours(_options.SessionDurationHours);
        var session = new AdminSession(Guid.NewGuid().ToString("N"), username, expiresAtUtc);
        _sessions[session.Id] = session;
        return session;
    }

    public AdminSession? GetSession(string? sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return null;
        }

        if (!_sessions.TryGetValue(sessionId, out var session))
        {
            return null;
        }

        if (session.ExpiresAtUtc <= _timeProvider.GetUtcNow())
        {
            _sessions.TryRemove(sessionId, out _);
            return null;
        }

        return session;
    }

    public void RemoveSession(string? sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return;
        }

        _sessions.TryRemove(sessionId, out _);
    }

    public sealed record AdminSession(string Id, string Username, DateTimeOffset ExpiresAtUtc);
}
