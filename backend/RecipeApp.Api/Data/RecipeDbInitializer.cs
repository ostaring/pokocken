using Microsoft.EntityFrameworkCore;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;

namespace RecipeApp.Api.Data;

public sealed class RecipeDbInitializer
{
    private readonly RecipeDbContext _dbContext;

    public RecipeDbInitializer(RecipeDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.Database.MigrateAsync(cancellationToken);

        if (await _dbContext.Recipes.AnyAsync(cancellationToken))
        {
            return;
        }

        var seedEntities = RecipeSeedData.CreateRecipes()
            .Select(MapToEntity)
            .ToList();

        await _dbContext.Recipes.AddRangeAsync(seedEntities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    internal static RecipeEntity MapToEntity(Recipe recipe) =>
        new()
        {
            Id = recipe.Id,
            Title = recipe.Title,
            Slug = recipe.Slug,
            Description = recipe.Description,
            Category = recipe.Category,
            PrepTimeMinutes = recipe.PrepTimeMinutes,
            Servings = recipe.Servings,
            ImageUrl = recipe.ImageUrl,
            IsPublished = recipe.IsPublished,
            IngredientsJson = SqliteRecipeRepository.SerializeList(recipe.Ingredients),
            StepsJson = SqliteRecipeRepository.SerializeList(recipe.Steps)
        };
}
