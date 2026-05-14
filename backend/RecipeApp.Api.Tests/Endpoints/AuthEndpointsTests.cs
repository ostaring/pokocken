using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Infrastructure;
using RecipeApp.Api.Tests.Infrastructure;
using RecipeApp.Api.Tests.Testing;
using Xunit;

namespace RecipeApp.Api.Tests.Endpoints;

public sealed class AuthEndpointsTests : IClassFixture<RecipeApiFactory>
{
    private readonly RecipeApiFactory _factory;

    public AuthEndpointsTests(RecipeApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_ReturnsSessionAndSetsCookie_ForValidCredentials()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            HandleCookies = false
        });

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginAdminRequest("admin", "admin123"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(response.Headers, header => header.Key == "Set-Cookie");
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), header => header.Contains("HttpOnly", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), header => header.Contains("SameSite=Strict", StringComparison.OrdinalIgnoreCase));

        var session = await response.Content.ReadFromJsonAsync<AdminSessionResponse>();
        Assert.NotNull(session);
        Assert.Equal("admin", session!.Username);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_ForInvalidCredentials()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginAdminRequest("admin", "wrong"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_ReturnsSession_AfterSuccessfulLogin()
    {
        using var client = _factory.CreateClient();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginAdminRequest("admin", "admin123"));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var meResponse = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);

        var session = await meResponse.Content.ReadFromJsonAsync<AdminSessionResponse>();
        Assert.NotNull(session);
        Assert.Equal("admin", session!.Username);
    }

    [Fact]
    public async Task Logout_ClearsSession()
    {
        using var client = _factory.CreateClient();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginAdminRequest("admin", "admin123"));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var logoutResponse = await client.PostAsync("/api/auth/logout", content: null);
        Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);

        var meResponse = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, meResponse.StatusCode);
    }

    [Fact]
    public async Task Me_ReturnsUnauthorized_AfterSessionExpires()
    {
        await _factory.ResetDatabaseAsync();
        var timeProvider = new MutableTimeProvider(new DateTimeOffset(2026, 4, 27, 10, 0, 0, TimeSpan.Zero));
        using var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddSingleton<TimeProvider>(timeProvider);
            });
        }).CreateClient();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginAdminRequest("admin", "admin123"));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        timeProvider.Advance(TimeSpan.FromDays(8));

        var meResponse = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, meResponse.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoints_AcceptApiKey_WhenFallbackIsEnabled()
    {
        await _factory.ResetDatabaseAsync();
        using var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, configurationBuilder) =>
            {
                configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Admin:AllowApiKeyFallback"] = "true"
                });
            });
        }).CreateClient();

        client.DefaultRequestHeaders.Add(AdminAuthConstants.ApiKeyHeaderName, "dev-admin-key");

        var response = await client.GetAsync("/api/admin/recipes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoints_RejectApiKey_WhenFallbackIsDisabled()
    {
        await _factory.ResetDatabaseAsync();
        using var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Production");
            builder.ConfigureAppConfiguration((_, configurationBuilder) =>
            {
                configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Admin:AllowApiKeyFallback"] = "false"
                });
            });
        }).CreateClient();

        client.DefaultRequestHeaders.Add(AdminAuthConstants.ApiKeyHeaderName, "dev-admin-key");

        var response = await client.GetAsync("/api/admin/recipes");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_AcceptsLegacyPasswordFallback_WhenHashIsMissing()
    {
        await _factory.ResetDatabaseAsync();
        using var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, configurationBuilder) =>
            {
                configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Admin:PasswordHash"] = "",
                    ["Admin:Password"] = "admin123"
                });
            });
        }).CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginAdminRequest("admin", "admin123"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_RejectsPassword_WhenConfiguredHashDoesNotMatch()
    {
        await _factory.ResetDatabaseAsync();
        using var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, configurationBuilder) =>
            {
                configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Admin:PasswordHash"] = "pbkdf2-sha256$10000$MDEyMzQ1Njc4OWFiY2RlZg==$99Xj15CkY6Pj7vY0z9h6m1rVlV5uXQzQeQ8Q0v9b4wQ=",
                    ["Admin:Password"] = ""
                });
            });
        }).CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginAdminRequest("admin", "admin123"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
