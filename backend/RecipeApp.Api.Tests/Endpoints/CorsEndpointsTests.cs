using System.Net;
using RecipeApp.Api.Tests.Testing;
using Xunit;

namespace RecipeApp.Api.Tests.Endpoints;

public sealed class CorsEndpointsTests : IClassFixture<RecipeApiFactory>
{
    private readonly RecipeApiFactory _factory;

    public CorsEndpointsTests(RecipeApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PreflightRequest_AllowsFrontendDevOrigin()
    {
        using var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Options, "/api/auth/login");
        request.Headers.Add("Origin", "http://localhost:5173");
        request.Headers.Add("Access-Control-Request-Method", "POST");
        request.Headers.Add("Access-Control-Request-Headers", "content-type");

        using var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal("http://localhost:5173", response.Headers.GetValues("Access-Control-Allow-Origin").Single());
        Assert.Equal("true", response.Headers.GetValues("Access-Control-Allow-Credentials").Single());
    }
}
