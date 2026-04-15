using RecipeApp.Api.Repositories;
using RecipeApp.Api.Services;
using Xunit;

namespace RecipeApp.Api.Tests.Services;

public sealed class RecipeServiceTests
{
    [Fact]
    public void GetPublishedRecipes_FiltersOutDrafts()
    {
        var repository = new InMemoryRecipeRepository();
        var service = new RecipeService(repository);

        var recipes = service.GetPublishedRecipes(search: null, category: null);

        Assert.NotEmpty(recipes);
        Assert.All(recipes, recipe => Assert.True(recipe.IsPublished));
        Assert.DoesNotContain(recipes, recipe => recipe.Slug == "draft-lemon-tart");
    }

    [Fact]
    public void GetPublishedRecipes_FiltersBySearch()
    {
        var repository = new InMemoryRecipeRepository();
        var service = new RecipeService(repository);

        var recipes = service.GetPublishedRecipes(search: "pasta", category: null);

        var recipe = Assert.Single(recipes);
        Assert.Equal("roasted-tomato-pasta", recipe.Slug);
    }

    [Fact]
    public void GetPublishedRecipes_FiltersByCategory()
    {
        var repository = new InMemoryRecipeRepository();
        var service = new RecipeService(repository);

        var recipes = service.GetPublishedRecipes(search: null, category: "Dessert");

        var recipe = Assert.Single(recipes);
        Assert.Equal("dark-chocolate-mousse", recipe.Slug);
    }

    [Fact]
    public void GetPublishedRecipeBySlug_ReturnsNullForDraft()
    {
        var repository = new InMemoryRecipeRepository();
        var service = new RecipeService(repository);

        var recipe = service.GetPublishedRecipeBySlug("draft-lemon-tart");

        Assert.Null(recipe);
    }

    [Fact]
    public void GetAllRecipes_IncludesDraftsForAdminQueries()
    {
        var repository = new InMemoryRecipeRepository();
        var service = new RecipeService(repository);

        var recipes = service.GetAllRecipes(search: null, category: null);

        Assert.Contains(recipes, recipe => recipe.Slug == "draft-lemon-tart");
    }
}
