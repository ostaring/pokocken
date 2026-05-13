using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using RecipeApp.Api.Data;
using Xunit;

namespace RecipeApp.Api.Tests.Data;

public sealed class RecipeDbInitializerTests : IDisposable
{
    private readonly string _tempDirectory;
    private readonly string _databasePath;

    public RecipeDbInitializerTests()
    {
        _tempDirectory = Path.Combine(Path.GetTempPath(), "recipe-app-dbinit-tests", Guid.NewGuid().ToString("N"));
        _databasePath = Path.Combine(_tempDirectory, "recipes.db");
    }

    [Fact]
    public async Task InitializeAsync_AppliesMigrationsAndSeedsRecipesWhenDatabaseIsMissing()
    {
        await using (var dbContext = CreateDbContext())
        {
            var initializer = new RecipeDbInitializer(dbContext, NullLogger<RecipeDbInitializer>.Instance);
            await initializer.InitializeAsync();
        }

        await using var verificationContext = CreateDbContext();
        var seededRecipes = await verificationContext.Recipes.ToListAsync();

        Assert.NotEmpty(seededRecipes);
        Assert.Contains(seededRecipes, recipe => recipe.Slug == "draft-lemon-tart");

        await using var connection = new SqliteConnection($"Data Source={_databasePath}");
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM __EFMigrationsHistory";
        var migrationCount = Convert.ToInt32(await command.ExecuteScalarAsync());

        Assert.True(migrationCount > 0);
    }

    [Fact]
    public async Task InitializeAsync_DoesNotDuplicateSeedDataWhenCalledTwice()
    {
        await using (var dbContext = CreateDbContext())
        {
            var initializer = new RecipeDbInitializer(dbContext, NullLogger<RecipeDbInitializer>.Instance);
            await initializer.InitializeAsync();
            await initializer.InitializeAsync();
        }

        await using var verificationContext = CreateDbContext();
        var recipeCount = await verificationContext.Recipes.CountAsync();
        var distinctSlugCount = await verificationContext.Recipes
            .Select(recipe => recipe.Slug)
            .Distinct()
            .CountAsync();

        Assert.Equal(distinctSlugCount, recipeCount);
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

    private RecipeDbContext CreateDbContext()
    {
        Directory.CreateDirectory(_tempDirectory);
        var options = new DbContextOptionsBuilder<RecipeDbContext>()
            .UseSqlite($"Data Source={_databasePath}")
            .Options;

        return new RecipeDbContext(options);
    }
}
