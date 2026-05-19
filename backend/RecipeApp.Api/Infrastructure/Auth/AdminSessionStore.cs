using System.Collections.Concurrent;
using System.Security.Cryptography;
using Microsoft.Extensions.Options;

namespace RecipeApp.Api.Infrastructure;

public sealed class AdminSessionStore
{
    private readonly ConcurrentDictionary<string, AdminSession> _sessions = new();
    private readonly TimeProvider _timeProvider;
    private readonly AdminAuthOptions _options;
    private readonly ILogger<AdminSessionStore> _logger;

    public AdminSessionStore(
        TimeProvider timeProvider,
        IOptions<AdminAuthOptions> options,
        ILogger<AdminSessionStore> logger)
    {
        _timeProvider = timeProvider;
        _options = options.Value;
        _logger = logger;
    }

    public AdminSession CreateSession(string username)
    {
        var expiresAtUtc = _timeProvider.GetUtcNow().AddHours(_options.SessionDurationHours);
        var session = new AdminSession(
            Guid.NewGuid().ToString("N"),
            username,
            Convert.ToHexString(RandomNumberGenerator.GetBytes(32)),
            expiresAtUtc);
        _sessions[session.Id] = session;
        _logger.LogInformation("Created admin session for user {Username} expiring at {ExpiresAtUtc}", username, expiresAtUtc);
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
            _logger.LogWarning("Admin session for user {Username} expired and was removed", session.Username);
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

        if (_sessions.TryRemove(sessionId, out var removedSession))
        {
            _logger.LogInformation("Removed admin session for user {Username}", removedSession.Username);
        }
    }

    public sealed record AdminSession(string Id, string Username, string CsrfToken, DateTimeOffset ExpiresAtUtc);
}
