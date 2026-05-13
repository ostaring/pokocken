using Microsoft.EntityFrameworkCore;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;

namespace RecipeApp.Api.Data;

public sealed class RecipeDbInitializer
{
    private readonly RecipeDbContext _dbContext;
    private readonly ILogger<RecipeDbInitializer> _logger;

    public RecipeDbInitializer(RecipeDbContext dbContext, ILogger<RecipeDbInitializer> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Applying database migrations");
        await _dbContext.Database.MigrateAsync(cancellationToken);

        var hasRecipes = await _dbContext.Recipes.AnyAsync(cancellationToken);
        var hasGalleryImages = await _dbContext.GalleryImages.AnyAsync(cancellationToken);

        if (hasRecipes && hasGalleryImages)
        {
            _logger.LogInformation("Database already contains recipe and gallery seed data");
            return;
        }

        if (!hasRecipes)
        {
            var seedRecipeEntities = RecipeSeedData.CreateRecipes()
                .Select(MapToEntity)
                .ToList();

            await _dbContext.Recipes.AddRangeAsync(seedRecipeEntities, cancellationToken);
            _logger.LogInformation("Queued {RecipeCount} seed recipes for initialization", seedRecipeEntities.Count);
        }

        if (!hasGalleryImages)
        {
            var seedGalleryEntities = GallerySeedData.CreateImages()
                .Select(GalleryDbMapper.MapToEntity)
                .ToList();

            await _dbContext.GalleryImages.AddRangeAsync(seedGalleryEntities, cancellationToken);
            _logger.LogInformation(
                "Queued {GalleryImageCount} seed gallery images for initialization",
                seedGalleryEntities.Count);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Database initialization completed");
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
