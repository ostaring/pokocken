using Microsoft.EntityFrameworkCore;
using RecipeApp.Api.Tests.Testing;
using Xunit;

namespace RecipeApp.Api.Tests.Data;

public sealed class RecipeDbInitializerTests : IClassFixture<PostgresTestDatabase>, IAsyncLifetime
{
    private readonly PostgresTestDatabase _database;

    public RecipeDbInitializerTests(PostgresTestDatabase database)
    {
        _database = database;
    }

    public Task InitializeAsync() => _database.ResetAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task InitializeAsync_AppliesMigrationsAndSeedsRecipesWhenDatabaseIsMissing()
    {
        await using var verificationContext = _database.CreateDbContext();
        var seededRecipes = await verificationContext.Recipes.ToListAsync();

        Assert.NotEmpty(seededRecipes);
        Assert.Contains(seededRecipes, recipe => recipe.Slug == "draft-lemon-tart");

        var migrationCount = (await verificationContext.Database.GetAppliedMigrationsAsync()).Count();

        Assert.True(migrationCount > 0);
    }

    [Fact]
    public async Task InitializeAsync_DoesNotDuplicateSeedDataWhenCalledTwice()
    {
        await _database.ResetAsync();

        await using var verificationContext = _database.CreateDbContext();
        var recipeCount = await verificationContext.Recipes.CountAsync();
        var distinctSlugCount = await verificationContext.Recipes
            .Select(recipe => recipe.Slug)
            .Distinct()
            .CountAsync();

        Assert.Equal(distinctSlugCount, recipeCount);
    }
}
