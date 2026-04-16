using System.Text.Json;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;
using Xunit;

namespace RecipeApp.Api.Tests.Repositories;

public sealed class FileRecipeRepositoryTests : IDisposable
{
    private readonly string _tempDirectory;
    private readonly string _filePath;

    public FileRecipeRepositoryTests()
    {
        _tempDirectory = Path.Combine(Path.GetTempPath(), "recipe-app-tests", Guid.NewGuid().ToString("N"));
        _filePath = Path.Combine(_tempDirectory, "recipes.json");
    }

    [Fact]
    public void Constructor_SeedsRecipesWhenTheStorageFileIsMissing()
    {
        var repository = new FileRecipeRepository(_filePath);

        var recipes = repository.GetAll();

        Assert.NotEmpty(recipes);
        Assert.True(File.Exists(_filePath));
    }

    [Fact]
    public void Add_PersistsRecipeForANewRepositoryInstance()
    {
        var repository = new FileRecipeRepository(_filePath);
        var recipe = CreateRecipe("crispy-chili-noodles");

        repository.Add(recipe);

        var reloadedRepository = new FileRecipeRepository(_filePath);
        var storedRecipe = reloadedRepository.GetBySlug("crispy-chili-noodles");

        Assert.NotNull(storedRecipe);
        Assert.Equal(recipe.Title, storedRecipe!.Title);
        Assert.Contains("Chili oil", storedRecipe.Ingredients);
    }

    [Fact]
    public void Replace_UpdatesThePersistedRecipe()
    {
        var repository = new FileRecipeRepository(_filePath);
        var updatedRecipe = CreateRecipe("published-lemon-tart") with
        {
            Title = "Published lemon tart",
            Category = "Dessert"
        };

        var replacedRecipe = repository.Replace("draft-lemon-tart", updatedRecipe);

        Assert.NotNull(replacedRecipe);

        var reloadedRepository = new FileRecipeRepository(_filePath);
        Assert.Null(reloadedRepository.GetBySlug("draft-lemon-tart"));
        Assert.NotNull(reloadedRepository.GetBySlug("published-lemon-tart"));
    }

    [Fact]
    public void Delete_RemovesRecipeFromThePersistedFile()
    {
        var repository = new FileRecipeRepository(_filePath);

        var deleted = repository.Delete("draft-lemon-tart");

        Assert.True(deleted);

        var json = File.ReadAllText(_filePath);
        var recipes = JsonSerializer.Deserialize<List<Recipe>>(json);

        Assert.NotNull(recipes);
        Assert.DoesNotContain(recipes!, recipe => recipe.Slug == "draft-lemon-tart");
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempDirectory))
        {
            Directory.Delete(_tempDirectory, recursive: true);
        }
    }

    private static Recipe CreateRecipe(string slug) =>
        new()
        {
            Id = Guid.NewGuid(),
            Title = "Crispy chili noodles",
            Slug = slug,
            Description = "Fast noodles with chili oil and crunchy toppings.",
            Category = "Dinner",
            PrepTimeMinutes = 18,
            Servings = 2,
            ImageUrl = "https://example.com/noodles.jpg",
            IsPublished = true,
            Ingredients = ["200 g noodles", "Chili oil", "Spring onion"],
            Steps = ["Boil noodles.", "Dress and serve."]
        };
}
