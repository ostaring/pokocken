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

    public RecipeResponse CreateRecipe(CreateRecipeRequest request)
    {
        var normalizedTitle = request.Title.Trim();
        var normalizedSlug = request.Slug.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(normalizedTitle))
        {
            throw new ArgumentException("Title is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(normalizedSlug))
        {
            throw new ArgumentException("Slug is required.", nameof(request));
        }

        if (_recipeRepository.GetBySlug(normalizedSlug) is not null)
        {
            throw new InvalidOperationException($"A recipe with slug '{normalizedSlug}' already exists.");
        }

        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = normalizedTitle,
            Slug = normalizedSlug,
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            PrepTimeMinutes = request.PrepTimeMinutes,
            Servings = request.Servings,
            ImageUrl = request.ImageUrl.Trim(),
            IsPublished = request.IsPublished,
            Ingredients = request.Ingredients
                .Select(ingredient => ingredient.Trim())
                .Where(ingredient => !string.IsNullOrWhiteSpace(ingredient))
                .ToList(),
            Steps = request.Steps
                .Select(step => step.Trim())
                .Where(step => !string.IsNullOrWhiteSpace(step))
                .ToList()
        };

        if (string.IsNullOrWhiteSpace(recipe.Description) ||
            string.IsNullOrWhiteSpace(recipe.Category) ||
            string.IsNullOrWhiteSpace(recipe.ImageUrl) ||
            recipe.PrepTimeMinutes <= 0 ||
            recipe.Servings <= 0 ||
            recipe.Ingredients.Count == 0 ||
            recipe.Steps.Count == 0)
        {
            throw new ArgumentException("Recipe payload is incomplete.", nameof(request));
        }

        return MapToResponse(_recipeRepository.Add(recipe));
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
