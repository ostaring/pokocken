using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RecipeApp.Api.Data;
using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public sealed class SqliteRecipeRepository : IRecipeRepository
{
    private static readonly JsonSerializerOptions SerializerOptions = new();
    private readonly RecipeDbContext _dbContext;

    public SqliteRecipeRepository(RecipeDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IReadOnlyList<Recipe> GetAll() => _dbContext.Recipes
        .AsNoTracking()
        .OrderBy(recipe => recipe.Title)
        .ToList()
        .Select(MapToDomain)
        .ToList();

    public Recipe? GetBySlug(string slug)
    {
        var recipe = _dbContext.Recipes
            .AsNoTracking()
            .FirstOrDefault(recipe => recipe.Slug.ToLower() == slug.ToLower());

        return recipe is null ? null : MapToDomain(recipe);
    }

    public Recipe Add(Recipe recipe)
    {
        var entity = RecipeDbInitializer.MapToEntity(recipe);
        _dbContext.Recipes.Add(entity);
        _dbContext.SaveChanges();
        return MapToDomain(entity);
    }

    public Recipe? Replace(string currentSlug, Recipe recipe)
    {
        var entity = _dbContext.Recipes
            .FirstOrDefault(existingRecipe => existingRecipe.Slug.ToLower() == currentSlug.ToLower());

        if (entity is null)
        {
            return null;
        }

        entity.Title = recipe.Title;
        entity.Slug = recipe.Slug;
        entity.Description = recipe.Description;
        entity.Category = recipe.Category;
        entity.PrepTimeMinutes = recipe.PrepTimeMinutes;
        entity.Servings = recipe.Servings;
        entity.ImageUrl = recipe.ImageUrl;
        entity.IsPublished = recipe.IsPublished;
        entity.IngredientsJson = SerializeList(recipe.Ingredients);
        entity.StepsJson = SerializeList(recipe.Steps);

        _dbContext.SaveChanges();
        return MapToDomain(entity);
    }

    public bool Delete(string slug)
    {
        var entity = _dbContext.Recipes
            .FirstOrDefault(existingRecipe => existingRecipe.Slug.ToLower() == slug.ToLower());

        if (entity is null)
        {
            return false;
        }

        _dbContext.Recipes.Remove(entity);
        _dbContext.SaveChanges();
        return true;
    }

    internal static string SerializeList(IReadOnlyList<string> values) =>
        JsonSerializer.Serialize(values, SerializerOptions);

    private static IReadOnlyList<string> DeserializeList(string json) =>
        JsonSerializer.Deserialize<List<string>>(json, SerializerOptions) ?? [];

    private static Recipe MapToDomain(RecipeEntity entity) =>
        new()
        {
            Id = entity.Id,
            Title = entity.Title,
            Slug = entity.Slug,
            Description = entity.Description,
            Category = entity.Category,
            PrepTimeMinutes = entity.PrepTimeMinutes,
            Servings = entity.Servings,
            ImageUrl = entity.ImageUrl,
            IsPublished = entity.IsPublished,
            Ingredients = DeserializeList(entity.IngredientsJson),
            Steps = DeserializeList(entity.StepsJson)
        };
}
