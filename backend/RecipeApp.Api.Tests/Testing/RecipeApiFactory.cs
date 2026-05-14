using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RecipeApp.Api.Data;
using Xunit;

namespace RecipeApp.Api.Tests.Testing;

public sealed class RecipeApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgresTestDatabase _database = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:RecipesDb", _database.ConnectionString);
        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:RecipesDb"] = _database.ConnectionString
            });
        });
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<RecipeDbContext>>();
            services.AddDbContext<RecipeDbContext>(options =>
            {
                options.UseNpgsql(_database.ConnectionString);
            });
        });
    }

    public new HttpClient CreateClient()
    {
        ResetDatabaseAsync().GetAwaiter().GetResult();
        return base.CreateClient();
    }

    public new HttpClient CreateClient(WebApplicationFactoryClientOptions options)
    {
        ResetDatabaseAsync().GetAwaiter().GetResult();
        return base.CreateClient(options);
    }

    public Task InitializeAsync() => _database.InitializeAsync();

    public new async Task DisposeAsync()
    {
        await _database.DisposeAsync();
        await base.DisposeAsync();
    }

    public Task ResetDatabaseAsync() => _database.ResetAsync();
}
