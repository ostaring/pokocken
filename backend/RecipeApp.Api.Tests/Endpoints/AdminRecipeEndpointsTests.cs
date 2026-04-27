using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Tests.Testing;
using Xunit;

namespace RecipeApp.Api.Tests.Endpoints;

public sealed class AdminRecipeEndpointsTests : IClassFixture<RecipeApiFactory>
{
    private readonly RecipeApiFactory _factory;

    public AdminRecipeEndpointsTests(RecipeApiFactory factory)
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
    public async Task GetAdminRecipes_ReturnsDraftsWhenAuthorizedWithSessionCookie()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var recipes = await client.GetFromJsonAsync<List<RecipeResponse>>("/api/admin/recipes");

        Assert.NotNull(recipes);
        Assert.Contains(recipes!, recipe => recipe.Slug == "draft-lemon-tart");
    }

    [Fact]
    public async Task GetAdminRecipeBySlug_ReturnsDraftWhenAuthorized()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var recipe = await client.GetFromJsonAsync<RecipeResponse>("/api/admin/recipes/draft-lemon-tart");

        Assert.NotNull(recipe);
        Assert.Equal("draft-lemon-tart", recipe!.Slug);
        Assert.False(recipe.IsPublished);
    }

    [Fact]
    public async Task PostAdminRecipe_ReturnsCreatedWhenAuthorized()
    {
        using var client = await CreateAuthenticatedClientAsync();

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
        using var client = await CreateAuthenticatedClientAsync();

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
    public async Task PostAdminRecipe_ReturnsValidationProblemForInvalidPayload()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/admin/recipes", new CreateRecipeRequest(
            " ",
            "Bad Slug",
            "",
            "",
            0,
            0,
            "not-a-url",
            false,
            [],
            [" "]));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        await AssertValidationErrorAsync(response, "title", "Title is required.");
        await AssertValidationErrorAsync(response, "slug", "Slug must contain lowercase letters, digits and hyphens only.");
        await AssertValidationErrorAsync(response, "ingredients", "At least one ingredient is required.");
    }

    [Fact]
    public async Task PutAdminRecipe_ReturnsUpdatedRecipeWhenAuthorized()
    {
        using var client = await CreateAuthenticatedClientAsync();

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
        using var client = await CreateAuthenticatedClientAsync();

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

    [Fact]
    public async Task PutAdminRecipe_ReturnsValidationProblemForInvalidPayload()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PutAsJsonAsync("/api/admin/recipes/draft-lemon-tart", new UpdateRecipeRequest(
            "Lemon tart",
            "invalid slug",
            "A tart.",
            "Dessert",
            30,
            8,
            "https://example.com/lemon.jpg",
            true,
            ["Sugar"],
            []));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        await AssertValidationErrorAsync(response, "slug", "Slug must contain lowercase letters, digits and hyphens only.");
        await AssertValidationErrorAsync(response, "steps", "At least one step is required.");
    }

    [Fact]
    public async Task DeleteAdminRecipe_ReturnsNoContentWhenAuthorized()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.DeleteAsync("/api/admin/recipes/draft-lemon-tart");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var followUpResponse = await client.GetAsync("/api/admin/recipes/draft-lemon-tart");
        Assert.Equal(HttpStatusCode.NotFound, followUpResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteAdminRecipe_ReturnsNotFoundForUnknownRecipe()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.DeleteAsync("/api/admin/recipes/missing-recipe");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = _factory.WithWebHostBuilder(_ => { }).CreateClient();
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginAdminRequest("admin", "admin123"));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        return client;
    }

    private static async Task AssertValidationErrorAsync(HttpResponseMessage response, string field, string expectedMessage)
    {
        using var jsonDocument = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var errors = jsonDocument.RootElement.GetProperty("errors");
        var fieldErrors = errors.GetProperty(field);

        Assert.Contains(fieldErrors.EnumerateArray(), element => element.GetString() == expectedMessage);
    }
}
