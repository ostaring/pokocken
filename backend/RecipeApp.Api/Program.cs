using RecipeApp.Api.Contracts;
using RecipeApp.Api.Infrastructure;
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

app.MapGet("/api/admin/recipes", (
    string? search,
    string? category,
    RecipeService recipeService) =>
{
    var recipes = recipeService.GetAllRecipes(search, category);
    return Results.Ok(recipes);
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.MapGet("/api/admin/recipes/{slug}", (string slug, RecipeService recipeService) =>
{
    var recipe = recipeService.GetRecipeBySlug(slug);
    return recipe is null ? Results.NotFound() : Results.Ok(recipe);
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.MapPost("/api/admin/recipes", (CreateRecipeRequest request, RecipeService recipeService) =>
{
    try
    {
        var createdRecipe = recipeService.CreateRecipe(request);
        return Results.Created($"/api/admin/recipes/{createdRecipe.Slug}", createdRecipe);
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (InvalidOperationException exception)
    {
        return Results.Conflict(new { message = exception.Message });
    }
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.MapPut("/api/admin/recipes/{slug}", (string slug, UpdateRecipeRequest request, RecipeService recipeService) =>
{
    try
    {
        var updatedRecipe = recipeService.UpdateRecipe(slug, request);
        return updatedRecipe is null ? Results.NotFound() : Results.Ok(updatedRecipe);
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (InvalidOperationException exception)
    {
        return Results.Conflict(new { message = exception.Message });
    }
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.MapDelete("/api/admin/recipes/{slug}", (string slug, RecipeService recipeService) =>
{
    var deleted = recipeService.DeleteRecipe(slug);
    return deleted ? Results.NoContent() : Results.NotFound();
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.Run();

public partial class Program;
