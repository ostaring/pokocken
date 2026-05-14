using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Tests.Testing;
using Xunit;

namespace RecipeApp.Api.Tests.Repositories;

public sealed class EfRecipeRepositoryTests : IClassFixture<PostgresTestDatabase>, IAsyncLifetime
{
    private readonly PostgresTestDatabase _database;

    public EfRecipeRepositoryTests(PostgresTestDatabase database)
    {
        _database = database;
    }

    public Task InitializeAsync() => _database.ResetAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task InitializeAsync_SeedsRecipesWhenDatabaseIsEmpty()
    {
        await using var verificationContext = _database.CreateDbContext();
        var repository = new EfRecipeRepository(verificationContext);
        var recipes = repository.GetAll();

        Assert.NotEmpty(recipes);
        Assert.Contains(recipes, recipe => recipe.Slug == "draft-lemon-tart");
    }

    [Fact]
    public async Task Add_PersistsRecipeForANewRepositoryInstance()
    {
        await using (var dbContext = _database.CreateDbContext())
        {
            var repository = new EfRecipeRepository(dbContext);
            repository.Add(CreateRecipe("crispy-chili-noodles"));
        }

        await using var verificationContext = _database.CreateDbContext();
        var reloadedRepository = new EfRecipeRepository(verificationContext);
        var storedRecipe = reloadedRepository.GetBySlug("crispy-chili-noodles");

        Assert.NotNull(storedRecipe);
        Assert.Equal("Crispy chili noodles", storedRecipe!.Title);
        Assert.Contains("Chili oil", storedRecipe.Ingredients);
    }

    [Fact]
    public async Task Replace_UpdatesThePersistedRecipe()
    {
        await using (var dbContext = _database.CreateDbContext())
        {
            var repository = new EfRecipeRepository(dbContext);
            var updatedRecipe = CreateRecipe("published-lemon-tart") with
            {
                Title = "Published lemon tart",
                Category = "Dessert"
            };

            var replacedRecipe = repository.Replace("draft-lemon-tart", updatedRecipe);
            Assert.NotNull(replacedRecipe);
        }

        await using var verificationContext = _database.CreateDbContext();
        var reloadedRepository = new EfRecipeRepository(verificationContext);
        Assert.Null(reloadedRepository.GetBySlug("draft-lemon-tart"));
        Assert.NotNull(reloadedRepository.GetBySlug("published-lemon-tart"));
    }

    [Fact]
    public async Task Delete_RemovesRecipeFromTheDatabase()
    {
        await using (var dbContext = _database.CreateDbContext())
        {
            var repository = new EfRecipeRepository(dbContext);
            var deleted = repository.Delete("draft-lemon-tart");
            Assert.True(deleted);
        }

        await using var verificationContext = _database.CreateDbContext();
        var reloadedRepository = new EfRecipeRepository(verificationContext);
        Assert.Null(reloadedRepository.GetBySlug("draft-lemon-tart"));
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
