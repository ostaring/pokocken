using RecipeApp.Api.Controllers;
using Microsoft.EntityFrameworkCore;
using RecipeApp.Api.Data;
using RecipeApp.Api.Infrastructure;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
var databaseConnectionString = builder.Configuration.GetConnectionString("RecipesDb");

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

builder.Services.AddDbContext<RecipeDbContext>(options =>
{
    options.UseNpgsql(databaseConnectionString);
});
builder.Services.AddScoped<IRecipeRepository, EfRecipeRepository>();
builder.Services.AddScoped<IGalleryRepository, EfGalleryRepository>();
builder.Services.AddScoped<RecipeDbInitializer>();
builder.Services.AddSingleton<AdminSessionStore>();
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<IGalleryService, GalleryService>();

var app = builder.Build();
app.UseCors("FrontendDevClient");
app.Logger.LogInformation(
    "Starting RecipeApp API in {Environment} with PostgreSQL persistence",
    app.Environment.EnvironmentName);

using (var scope = app.Services.CreateScope())
{
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
