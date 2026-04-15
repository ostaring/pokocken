using RecipeApp.Api.Contracts;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;

namespace RecipeApp.Api.Services;

public sealed class RecipeService
{
    private readonly IRecipeRepository _recipeRepository;

    public RecipeService(IRecipeRepository recipeRepository)
    {
        _recipeRepository = recipeRepository;
    }

    public IReadOnlyList<RecipeResponse> GetPublishedRecipes(string? search, string? category)
    {
        var normalizedSearch = search?.Trim();
        var normalizedCategory = category?.Trim();

        return _recipeRepository
            .GetAll()
            .Where(recipe => recipe.IsPublished)
            .Where(recipe => MatchesFilters(recipe, normalizedSearch, normalizedCategory))
            .Select(MapToResponse)
            .ToList();
    }

    public RecipeResponse? GetPublishedRecipeBySlug(string slug)
    {
        var recipe = _recipeRepository.GetBySlug(slug);
        if (recipe is null || !recipe.IsPublished)
        {
            return null;
        }

        return MapToResponse(recipe);
    }

    public IReadOnlyList<RecipeResponse> GetAllRecipes(string? search, string? category)
    {
        var normalizedSearch = search?.Trim();
        var normalizedCategory = category?.Trim();

        return _recipeRepository
            .GetAll()
            .Where(recipe => MatchesFilters(recipe, normalizedSearch, normalizedCategory))
            .Select(MapToResponse)
            .ToList();
    }

    public RecipeResponse? GetRecipeBySlug(string slug)
    {
        var recipe = _recipeRepository.GetBySlug(slug);
        return recipe is null ? null : MapToResponse(recipe);
    }

    private static bool MatchesFilters(Recipe recipe, string? normalizedSearch, string? normalizedCategory) =>
        (string.IsNullOrWhiteSpace(normalizedSearch) ||
         recipe.Title.Contains(normalizedSearch, StringComparison.OrdinalIgnoreCase) ||
         recipe.Description.Contains(normalizedSearch, StringComparison.OrdinalIgnoreCase)) &&
        (string.IsNullOrWhiteSpace(normalizedCategory) ||
         string.Equals(recipe.Category, normalizedCategory, StringComparison.OrdinalIgnoreCase));

    private static RecipeResponse MapToResponse(Recipe recipe) =>
        new(
            recipe.Id,
            recipe.Title,
            recipe.Slug,
            recipe.Description,
            recipe.Category,
            recipe.PrepTimeMinutes,
            recipe.Servings,
            recipe.ImageUrl,
            recipe.IsPublished,
            recipe.Ingredients,
            recipe.Steps);
}
