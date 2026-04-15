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
        using var client = _factory.WithWebHostBuilder(_ => { }).CreateClient();
        client.DefaultRequestHeaders.Add("X-Admin-Api-Key", AdminApiKey);

        var recipes = await client.GetFromJsonAsync<List<RecipeResponse>>("/api/admin/recipes");

        Assert.NotNull(recipes);
        Assert.Contains(recipes!, recipe => recipe.Slug == "draft-lemon-tart");
    }

    [Fact]
    public async Task GetAdminRecipeBySlug_ReturnsDraftWhenAuthorized()
    {
        using var client = _factory.WithWebHostBuilder(_ => { }).CreateClient();
        client.DefaultRequestHeaders.Add("X-Admin-Api-Key", AdminApiKey);

        var recipe = await client.GetFromJsonAsync<RecipeResponse>("/api/admin/recipes/draft-lemon-tart");

        Assert.NotNull(recipe);
        Assert.Equal("draft-lemon-tart", recipe!.Slug);
        Assert.False(recipe.IsPublished);
    }

    [Fact]
    public async Task PostAdminRecipe_ReturnsCreatedWhenAuthorized()
    {
        using var client = _factory.WithWebHostBuilder(_ => { }).CreateClient();
        client.DefaultRequestHeaders.Add("X-Admin-Api-Key", AdminApiKey);

        var response = await client.PostAsJsonAsync("/api/admin/recipes", new CreateRecipeRequest(
            "Herby potato salad",
            "herby-potato-salad",
            "Warm potatoes with herbs and mustard dressing.",
            "Lunch",
            30,
            4,
            "https://example.com/potato-salad.jpg",
            false,
            ["1 kg potatoes", "Parsley", "Mustard"],
            ["Boil potatoes.", "Dress and toss."]));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var createdRecipe = await response.Content.ReadFromJsonAsync<RecipeResponse>();
        Assert.NotNull(createdRecipe);
        Assert.Equal("herby-potato-salad", createdRecipe!.Slug);
        Assert.Equal("/api/admin/recipes/herby-potato-salad", response.Headers.Location?.OriginalString);
    }

    [Fact]
    public async Task PostAdminRecipe_ReturnsConflictForDuplicateSlug()
    {
        using var client = _factory.WithWebHostBuilder(_ => { }).CreateClient();
        client.DefaultRequestHeaders.Add("X-Admin-Api-Key", AdminApiKey);

        var response = await client.PostAsJsonAsync("/api/admin/recipes", new CreateRecipeRequest(
            "Duplicate pancake",
            "brown-butter-pancakes",
            "Should fail because the slug already exists.",
            "Breakfast",
            12,
            2,
            "https://example.com/duplicate.jpg",
            true,
            ["Flour"],
            ["Mix."]));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task PutAdminRecipe_ReturnsUpdatedRecipeWhenAuthorized()
    {
        using var client = _factory.WithWebHostBuilder(_ => { }).CreateClient();
        client.DefaultRequestHeaders.Add("X-Admin-Api-Key", AdminApiKey);

        var response = await client.PutAsJsonAsync("/api/admin/recipes/draft-lemon-tart", new UpdateRecipeRequest(
            "Published lemon tart",
            "published-lemon-tart",
            "A polished lemon tart recipe for launch.",
            "Dessert",
            55,
            8,
            "https://example.com/lemon-tart.jpg",
            true,
            ["Pastry shell", "Lemons", "Butter", "Sugar", "Eggs"],
            ["Blind bake.", "Mix filling.", "Bake."]));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updatedRecipe = await response.Content.ReadFromJsonAsync<RecipeResponse>();
        Assert.NotNull(updatedRecipe);
        Assert.Equal("published-lemon-tart", updatedRecipe!.Slug);
        Assert.True(updatedRecipe.IsPublished);
    }

    [Fact]
    public async Task PutAdminRecipe_ReturnsNotFoundForUnknownRecipe()
    {
        using var client = _factory.WithWebHostBuilder(_ => { }).CreateClient();
        client.DefaultRequestHeaders.Add("X-Admin-Api-Key", AdminApiKey);

        var response = await client.PutAsJsonAsync("/api/admin/recipes/missing-recipe", new UpdateRecipeRequest(
            "Missing recipe",
            "missing-recipe",
            "This recipe does not exist.",
            "Dinner",
            20,
            2,
            "https://example.com/missing.jpg",
            false,
            ["Ingredient"],
            ["Cook."]));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
