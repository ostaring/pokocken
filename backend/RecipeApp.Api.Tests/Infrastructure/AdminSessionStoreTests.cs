using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using RecipeApp.Api.Infrastructure;
using Xunit;

namespace RecipeApp.Api.Tests.Infrastructure;

public sealed class AdminSessionStoreTests
{
    [Fact]
    public void GetSession_ReturnsNullAfterExpiration()
    {
        var timeProvider = new MutableTimeProvider(new DateTimeOffset(2026, 4, 27, 10, 0, 0, TimeSpan.Zero));
        var options = Options.Create(new AdminAuthOptions
        {
            SessionDurationHours = 1
        });
        var sessionStore = new AdminSessionStore(timeProvider, options, NullLogger<AdminSessionStore>.Instance);

        var session = sessionStore.CreateSession("admin");
        timeProvider.Advance(TimeSpan.FromHours(2));

        var resolvedSession = sessionStore.GetSession(session.Id);

        Assert.Null(resolvedSession);
    }

    [Fact]
    public void CreateSession_UsesConfiguredSessionDuration()
    {
        var now = new DateTimeOffset(2026, 4, 27, 10, 0, 0, TimeSpan.Zero);
        var timeProvider = new MutableTimeProvider(now);
        var options = Options.Create(new AdminAuthOptions
        {
            SessionDurationHours = 12
        });
        var sessionStore = new AdminSessionStore(timeProvider, options, NullLogger<AdminSessionStore>.Instance);

        var session = sessionStore.CreateSession("admin");

        Assert.Equal(now.AddHours(12), session.ExpiresAtUtc);
    }
}
