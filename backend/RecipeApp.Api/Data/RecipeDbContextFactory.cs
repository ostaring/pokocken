using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace RecipeApp.Api.Data;

public sealed class RecipeDbContextFactory : IDesignTimeDbContextFactory<RecipeDbContext>
{
    public RecipeDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("RecipesDb")
            ?? "Host=localhost;Port=5432;Database=pokocken;Username=pokocken;Password=pokocken";

        var optionsBuilder = new DbContextOptionsBuilder<RecipeDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new RecipeDbContext(optionsBuilder.Options);
    }
}
