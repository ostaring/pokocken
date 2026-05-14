using Microsoft.Extensions.Logging.Abstractions;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Services;
using Xunit;

namespace RecipeApp.Api.Tests.Services;

public sealed class RecipeServiceTests
{
    [Fact]
    public void GetPublishedRecipes_FiltersOutDrafts()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var recipes = service.GetPublishedRecipes(search: null, category: null);

        Assert.NotEmpty(recipes);
        Assert.All(recipes, recipe => Assert.True(recipe.IsPublished));
        Assert.DoesNotContain(recipes, recipe => recipe.Slug == "draft-lemon-tart");
    }

    [Fact]
    public void GetPublishedRecipes_FiltersBySearch()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var recipes = service.GetPublishedRecipes(search: "pasta", category: null);

        var recipe = Assert.Single(recipes);
        Assert.Equal("roasted-tomato-pasta", recipe.Slug);
    }

    [Fact]
    public void GetPublishedRecipes_FiltersByCategory()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var recipes = service.GetPublishedRecipes(search: null, category: "Dessert");

        var recipe = Assert.Single(recipes);
        Assert.Equal("dark-chocolate-mousse", recipe.Slug);
    }

    [Fact]
    public void GetPublishedRecipeBySlug_ReturnsNullForDraft()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var recipe = service.GetPublishedRecipeBySlug("draft-lemon-tart");

        Assert.Null(recipe);
    }

    [Fact]
    public void GetAllRecipes_IncludesDraftsForAdminQueries()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var recipes = service.GetAllRecipes(search: null, category: null);

        Assert.Contains(recipes, recipe => recipe.Slug == "draft-lemon-tart");
    }

    [Fact]
    public void CreateRecipe_AddsRecipeForAdminFlows()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var createdRecipe = service.CreateRecipe(new(
            "Crispy chili noodles",
            "crispy-chili-noodles",
            "Fast noodles with chili oil and crunchy toppings.",
            "Dinner",
            18,
            2,
            "https://example.com/noodles.jpg",
            true,
            ["200 g noodles", "Chili oil", "Spring onion"],
            ["Boil noodles.", "Dress and serve."]));

        Assert.Equal("crispy-chili-noodles", createdRecipe.Slug);
        Assert.Contains(repository.GetAll(), recipe => recipe.Slug == "crispy-chili-noodles");
    }

    [Fact]
    public void CreateRecipe_ThrowsForDuplicateSlug()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var action = () => service.CreateRecipe(new(
            "Another pancake recipe",
            "brown-butter-pancakes",
            "Duplicate slug should fail.",
            "Breakfast",
            10,
            2,
            "https://example.com/pancakes.jpg",
            true,
            ["Flour"],
            ["Mix."]));

        var exception = Assert.Throws<InvalidOperationException>(action);
        Assert.Contains("already exists", exception.Message);
    }

    [Fact]
    public void UpdateRecipe_UpdatesExistingRecipeIncludingSlug()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var updatedRecipe = service.UpdateRecipe("draft-lemon-tart", new(
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

        Assert.NotNull(updatedRecipe);
        Assert.Equal("published-lemon-tart", updatedRecipe!.Slug);
        Assert.True(updatedRecipe.IsPublished);
        Assert.Null(repository.GetBySlug("draft-lemon-tart"));
        Assert.NotNull(repository.GetBySlug("published-lemon-tart"));
    }

    [Fact]
    public void UpdateRecipe_ThrowsForDuplicateSlug()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var action = () => service.UpdateRecipe("draft-lemon-tart", new(
            "Clashing tart",
            "brown-butter-pancakes",
            "Should fail.",
            "Dessert",
            40,
            6,
            "https://example.com/conflict.jpg",
            false,
            ["Lemons"],
            ["Bake."]));

        var exception = Assert.Throws<InvalidOperationException>(action);
        Assert.Contains("already exists", exception.Message);
    }

    [Fact]
    public void DeleteRecipe_RemovesRecipeWhenItExists()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var deleted = service.DeleteRecipe("draft-lemon-tart");

        Assert.True(deleted);
        Assert.Null(repository.GetBySlug("draft-lemon-tart"));
    }

    [Fact]
    public void DeleteRecipe_ReturnsFalseWhenRecipeDoesNotExist()
    {
        var repository = new TestRecipeRepository();
        var service = CreateService(repository);

        var deleted = service.DeleteRecipe("missing-recipe");

        Assert.False(deleted);
    }

    private static RecipeService CreateService(IRecipeRepository repository) =>
        new(repository, NullLogger<RecipeService>.Instance);

    private sealed class TestRecipeRepository : IRecipeRepository
    {
        private readonly List<Recipe> _recipes = RecipeSeedData.CreateRecipes().ToList();

        public IReadOnlyList<Recipe> GetAll() => _recipes
            .OrderBy(recipe => recipe.Title)
            .ToList();

        public Recipe? GetBySlug(string slug) =>
            _recipes.FirstOrDefault(recipe => string.Equals(recipe.Slug, slug, StringComparison.OrdinalIgnoreCase));

        public Recipe Add(Recipe recipe)
        {
            _recipes.Add(recipe);
            return recipe;
        }

        public Recipe? Replace(string currentSlug, Recipe recipe)
        {
            var index = _recipes.FindIndex(existingRecipe =>
                string.Equals(existingRecipe.Slug, currentSlug, StringComparison.OrdinalIgnoreCase));

            if (index < 0)
            {
                return null;
            }

            _recipes[index] = recipe;
            return recipe;
        }

        public bool Delete(string slug)
        {
            var recipe = GetBySlug(slug);
            return recipe is not null && _recipes.Remove(recipe);
        }
    }
}
