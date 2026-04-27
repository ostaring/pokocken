using RecipeApp.Api.Infrastructure;
using Xunit;

namespace RecipeApp.Api.Tests.Infrastructure;

public sealed class AdminPasswordHasherTests
{
    [Fact]
    public void Verify_ReturnsTrue_ForMatchingPbkdf2Hash()
    {
        var hasher = new AdminPasswordHasher();
        var hash = AdminPasswordHasher.HashPassword("admin123", iterations: 10_000);

        var verified = hasher.Verify("admin123", hash, configuredLegacyPassword: null);

        Assert.True(verified);
    }

    [Fact]
    public void Verify_ReturnsFalse_ForWrongPasswordAgainstHash()
    {
        var hasher = new AdminPasswordHasher();
        var hash = AdminPasswordHasher.HashPassword("admin123", iterations: 10_000);

        var verified = hasher.Verify("wrong", hash, configuredLegacyPassword: null);

        Assert.False(verified);
    }

    [Fact]
    public void Verify_FallsBackToLegacyPassword_WhenHashIsMissing()
    {
        var hasher = new AdminPasswordHasher();

        var verified = hasher.Verify("admin123", configuredPasswordHash: null, configuredLegacyPassword: "admin123");

        Assert.True(verified);
    }
}
