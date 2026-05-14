using Microsoft.EntityFrameworkCore;
using RecipeApp.Api.Data;
using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public sealed class EfRecipeRepository : IRecipeRepository
{
    private readonly RecipeDbContext _dbContext;

    public EfRecipeRepository(RecipeDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IReadOnlyList<Recipe> GetAll() => _dbContext.Recipes
        .AsNoTracking()
        .OrderBy(recipe => recipe.Title)
        .ToList()
        .Select(RecipeDbMapper.MapToDomain)
        .ToList();

    public Recipe? GetBySlug(string slug)
    {
        var normalizedSlug = slug.ToLowerInvariant();
        var recipe = _dbContext.Recipes
            .AsNoTracking()
            .FirstOrDefault(recipe => recipe.Slug.ToLower() == normalizedSlug);

        return recipe is null ? null : RecipeDbMapper.MapToDomain(recipe);
    }

    public Recipe Add(Recipe recipe)
    {
        var entity = RecipeDbMapper.MapToEntity(recipe);
        _dbContext.Recipes.Add(entity);
        _dbContext.SaveChanges();
        return RecipeDbMapper.MapToDomain(entity);
    }

    public Recipe? Replace(string currentSlug, Recipe recipe)
    {
        var normalizedSlug = currentSlug.ToLowerInvariant();
        var entity = _dbContext.Recipes
            .FirstOrDefault(existingRecipe => existingRecipe.Slug.ToLower() == normalizedSlug);

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
        entity.IngredientsJson = RecipeDbMapper.SerializeList(recipe.Ingredients);
        entity.StepsJson = RecipeDbMapper.SerializeList(recipe.Steps);

        _dbContext.SaveChanges();
        return RecipeDbMapper.MapToDomain(entity);
    }

    public bool Delete(string slug)
    {
        var normalizedSlug = slug.ToLowerInvariant();
        var entity = _dbContext.Recipes
            .FirstOrDefault(existingRecipe => existingRecipe.Slug.ToLower() == normalizedSlug);

        if (entity is null)
        {
            return false;
        }

        _dbContext.Recipes.Remove(entity);
        _dbContext.SaveChanges();
        return true;
    }
}
