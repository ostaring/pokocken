using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using RecipeApp.Api.Data;
using Testcontainers.PostgreSql;
using Xunit;

namespace RecipeApp.Api.Tests.Testing;

public sealed class PostgresTestDatabase : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder("postgres:16-alpine")
        .WithDatabase("pokocken_tests")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .Build();

    public string ConnectionString => _container.GetConnectionString();

    public Task InitializeAsync() => _container.StartAsync();

    public Task DisposeAsync() => _container.DisposeAsync().AsTask();

    public RecipeDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<RecipeDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        return new RecipeDbContext(options);
    }

    public async Task ResetAsync()
    {
        await using var dbContext = CreateDbContext();
        await dbContext.Database.MigrateAsync();
        dbContext.GalleryImages.RemoveRange(dbContext.GalleryImages);
        dbContext.Recipes.RemoveRange(dbContext.Recipes);
        await dbContext.SaveChangesAsync();

        var initializer = new RecipeDbInitializer(dbContext, NullLogger<RecipeDbInitializer>.Instance);
        await initializer.InitializeAsync();
    }
}
