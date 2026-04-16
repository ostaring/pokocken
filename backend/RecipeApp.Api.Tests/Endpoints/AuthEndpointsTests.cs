using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using RecipeApp.Api.Contracts;
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
}
