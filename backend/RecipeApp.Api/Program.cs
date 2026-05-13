using RecipeApp.Api.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RecipeApp.Api.Data;
using RecipeApp.Api.Infrastructure;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
var persistenceMode = builder.Configuration["Persistence:Mode"] ?? "Memory";
var sqliteConnectionString = builder.Configuration.GetConnectionString("RecipesDb");

builder.Services.Configure<AdminAuthOptions>(builder.Configuration.GetSection("Admin"));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<AdminPasswordHasher>();
builder.Services.AddScoped<AdminAuthorizationFilter>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDevClient", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.WithOrigins("http://localhost:5173");
        }
        else
        {
            policy.WithOrigins(allowedOrigins);
        }

        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

if (string.Equals(persistenceMode, "Sqlite", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddDbContext<RecipeDbContext>(options =>
    {
        options.UseSqlite(sqliteConnectionString);
    });
    builder.Services.AddScoped<IRecipeRepository, SqliteRecipeRepository>();
    builder.Services.AddScoped<IGalleryRepository, SqliteGalleryRepository>();
    builder.Services.AddScoped<RecipeDbInitializer>();
}
else if (string.Equals(persistenceMode, "File", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddSingleton<IRecipeRepository>(_ =>
    {
        var storagePath = builder.Configuration["Persistence:RecipesFilePath"];
        return new FileRecipeRepository(storagePath!);
    });
    builder.Services.AddSingleton<IGalleryRepository>(_ =>
    {
        var storagePath = builder.Configuration["Persistence:GalleryFilePath"];
        return new FileGalleryRepository(storagePath!);
    });
}
else
{
    builder.Services.AddSingleton<IRecipeRepository, InMemoryRecipeRepository>();
    builder.Services.AddSingleton<IGalleryRepository, InMemoryGalleryRepository>();
}

builder.Services.AddSingleton<AdminSessionStore>();
builder.Services.AddScoped<RecipeService>();
builder.Services.AddScoped<GalleryService>();

var app = builder.Build();
app.UseCors("FrontendDevClient");
app.Logger.LogInformation(
    "Starting RecipeApp API in {Environment} with persistence mode {PersistenceMode}",
    app.Environment.EnvironmentName,
    persistenceMode);

if (string.Equals(persistenceMode, "Sqlite", StringComparison.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var initializer = scope.ServiceProvider.GetRequiredService<RecipeDbInitializer>();
    try
    {
        await initializer.InitializeAsync();
    }
    catch (Exception exception)
    {
        app.Logger.LogError(exception, "Database initialization failed");
        throw;
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapControllers();

app.Run();

public partial class Program;
