using RecipeApp.Api.Contracts;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IRecipeRepository, InMemoryRecipeRepository>();
builder.Services.AddSingleton<RecipeService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapGet("/api/recipes", (
    string? search,
    string? category,
    RecipeService recipeService) =>
{
    var recipes = recipeService.GetPublishedRecipes(search, category);
    return Results.Ok(recipes);
});

app.MapGet("/api/recipes/{slug}", (string slug, RecipeService recipeService) =>
{
    var recipe = recipeService.GetPublishedRecipeBySlug(slug);
    return recipe is null ? Results.NotFound() : Results.Ok(recipe);
});

app.Run();

public partial class Program;
