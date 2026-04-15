using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using RecipeApp.Api.Contracts;
using Xunit;

namespace RecipeApp.Api.Tests.Endpoints;

public sealed class AdminRecipeEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const string AdminApiKey = "dev-admin-key";
    private readonly WebApplicationFactory<Program> _factory;

    public AdminRecipeEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetAdminRecipes_ReturnsUnauthorizedWithoutApiKey()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/admin/recipes");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAdminRecipes_ReturnsDraftsWhenAuthorized()
    {
        using var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Admin-Api-Key", AdminApiKey);

        var recipes = await client.GetFromJsonAsync<List<RecipeResponse>>("/api/admin/recipes");

        Assert.NotNull(recipes);
        Assert.Contains(recipes!, recipe => recipe.Slug == "draft-lemon-tart");
    }

    [Fact]
    public async Task GetAdminRecipeBySlug_ReturnsDraftWhenAuthorized()
    {
        using var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Admin-Api-Key", AdminApiKey);

        var recipe = await client.GetFromJsonAsync<RecipeResponse>("/api/admin/recipes/draft-lemon-tart");

        Assert.NotNull(recipe);
        Assert.Equal("draft-lemon-tart", recipe!.Slug);
        Assert.False(recipe.IsPublished);
    }
}
