using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.EntityFrameworkCore;
using RecipeApp.Api.Data;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;
using Xunit;

namespace RecipeApp.Api.Tests.Repositories;

public sealed class SqliteRecipeRepositoryTests : IDisposable
{
    private readonly string _tempDirectory;
    private readonly string _databasePath;

    public SqliteRecipeRepositoryTests()
    {
        _tempDirectory = Path.Combine(Path.GetTempPath(), "recipe-app-sqlite-tests", Guid.NewGuid().ToString("N"));
        _databasePath = Path.Combine(_tempDirectory, "recipes.db");
    }

    [Fact]
    public async Task InitializeAsync_SeedsRecipesWhenDatabaseIsEmpty()
    {
        await using (var dbContext = CreateDbContext())
        {
            var initializer = new RecipeDbInitializer(dbContext, NullLogger<RecipeDbInitializer>.Instance);
            await initializer.InitializeAsync();
        }

        await using var verificationContext = CreateDbContext();
        var repository = new SqliteRecipeRepository(verificationContext);
        var recipes = repository.GetAll();

        Assert.NotEmpty(recipes);
        Assert.Contains(recipes, recipe => recipe.Slug == "draft-lemon-tart");
    }

    [Fact]
    public async Task Add_PersistsRecipeForANewRepositoryInstance()
    {
        await InitializeDatabaseAsync();

        await using (var dbContext = CreateDbContext())
        {
            var repository = new SqliteRecipeRepository(dbContext);
            repository.Add(CreateRecipe("crispy-chili-noodles"));
        }

        await using var verificationContext = CreateDbContext();
        var reloadedRepository = new SqliteRecipeRepository(verificationContext);
        var storedRecipe = reloadedRepository.GetBySlug("crispy-chili-noodles");

        Assert.NotNull(storedRecipe);
        Assert.Equal("Crispy chili noodles", storedRecipe!.Title);
        Assert.Contains("Chili oil", storedRecipe.Ingredients);
    }

    [Fact]
    public async Task Replace_UpdatesThePersistedRecipe()
    {
        await InitializeDatabaseAsync();

        await using (var dbContext = CreateDbContext())
        {
            var repository = new SqliteRecipeRepository(dbContext);
            var updatedRecipe = CreateRecipe("published-lemon-tart") with
            {
                Title = "Published lemon tart",
                Category = "Dessert"
            };

            var replacedRecipe = repository.Replace("draft-lemon-tart", updatedRecipe);
            Assert.NotNull(replacedRecipe);
        }

        await using var verificationContext = CreateDbContext();
        var reloadedRepository = new SqliteRecipeRepository(verificationContext);
        Assert.Null(reloadedRepository.GetBySlug("draft-lemon-tart"));
        Assert.NotNull(reloadedRepository.GetBySlug("published-lemon-tart"));
    }

    [Fact]
    public async Task Delete_RemovesRecipeFromTheDatabase()
    {
        await InitializeDatabaseAsync();

        await using (var dbContext = CreateDbContext())
        {
            var repository = new SqliteRecipeRepository(dbContext);
            var deleted = repository.Delete("draft-lemon-tart");
            Assert.True(deleted);
        }

        await using var verificationContext = CreateDbContext();
        var reloadedRepository = new SqliteRecipeRepository(verificationContext);
        Assert.Null(reloadedRepository.GetBySlug("draft-lemon-tart"));
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_tempDirectory))
            {
                Directory.Delete(_tempDirectory, recursive: true);
            }
        }
        catch (IOException)
        {
        }
        catch (UnauthorizedAccessException)
        {
        }
    }

    private async Task InitializeDatabaseAsync()
    {
        await using var dbContext = CreateDbContext();
        var initializer = new RecipeDbInitializer(dbContext, NullLogger<RecipeDbInitializer>.Instance);
        await initializer.InitializeAsync();
    }

    private RecipeDbContext CreateDbContext()
    {
        Directory.CreateDirectory(_tempDirectory);
        var options = new DbContextOptionsBuilder<RecipeDbContext>()
            .UseSqlite($"Data Source={_databasePath}")
            .Options;

        return new RecipeDbContext(options);
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
