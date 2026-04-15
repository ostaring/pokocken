using System.Collections.Concurrent;

namespace RecipeApp.Api.Infrastructure;

public sealed class AdminSessionStore
{
    private readonly ConcurrentDictionary<string, AdminSession> _sessions = new();

    public AdminSession CreateSession(string username)
    {
        var session = new AdminSession(Guid.NewGuid().ToString("N"), username);
        _sessions[session.Id] = session;
        return session;
    }

    public AdminSession? GetSession(string? sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return null;
        }

        return _sessions.TryGetValue(sessionId, out var session) ? session : null;
    }

    public void RemoveSession(string? sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return;
        }

        _sessions.TryRemove(sessionId, out _);
    }

    public sealed record AdminSession(string Id, string Username);
}
