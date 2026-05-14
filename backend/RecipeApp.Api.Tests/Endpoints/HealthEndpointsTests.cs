using System.Net;
using System.Net.Http.Json;
using RecipeApp.Api.Tests.Testing;
using Xunit;

namespace RecipeApp.Api.Tests.Endpoints;

public sealed class HealthEndpointsTests : IClassFixture<RecipeApiFactory>
{
    private readonly RecipeApiFactory _factory;

    public HealthEndpointsTests(RecipeApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Health_ReturnsOkAndDatabaseStatus()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var payload = await response.Content.ReadFromJsonAsync<HealthResponse>();
        Assert.NotNull(payload);
        Assert.Equal("ok", payload!.Status);
        Assert.Equal("PostgreSQL", payload.Database);
        Assert.True(payload.CanConnect);
    }

    private sealed record HealthResponse(string Status, string Database, bool CanConnect);
}
