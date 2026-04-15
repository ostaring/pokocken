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
        var payload = ValidateAndNormalizePayload(request.Title, request.Slug, request.Description, request.Category,
            request.PrepTimeMinutes, request.Servings, request.ImageUrl, request.IsPublished, request.Ingredients, request.Steps);

        if (_recipeRepository.GetBySlug(payload.Slug) is not null)
        {
            throw new InvalidOperationException($"A recipe with slug '{payload.Slug}' already exists.");
        }

        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = payload.Title,
            Slug = payload.Slug,
            Description = payload.Description,
            Category = payload.Category,
            PrepTimeMinutes = payload.PrepTimeMinutes,
            Servings = payload.Servings,
            ImageUrl = payload.ImageUrl,
            IsPublished = payload.IsPublished,
            Ingredients = payload.Ingredients,
            Steps = payload.Steps
        };

        return MapToResponse(_recipeRepository.Add(recipe));
    }

    public RecipeResponse? UpdateRecipe(string currentSlug, UpdateRecipeRequest request)
    {
        var existingRecipe = _recipeRepository.GetBySlug(currentSlug);
        if (existingRecipe is null)
        {
            return null;
        }

        var payload = ValidateAndNormalizePayload(request.Title, request.Slug, request.Description, request.Category,
            request.PrepTimeMinutes, request.Servings, request.ImageUrl, request.IsPublished, request.Ingredients, request.Steps);

        var conflictingRecipe = _recipeRepository.GetBySlug(payload.Slug);
        if (conflictingRecipe is not null &&
            !string.Equals(conflictingRecipe.Slug, currentSlug, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"A recipe with slug '{payload.Slug}' already exists.");
        }

        var updatedRecipe = existingRecipe with
        {
            Title = payload.Title,
            Slug = payload.Slug,
            Description = payload.Description,
            Category = payload.Category,
            PrepTimeMinutes = payload.PrepTimeMinutes,
            Servings = payload.Servings,
            ImageUrl = payload.ImageUrl,
            IsPublished = payload.IsPublished,
            Ingredients = payload.Ingredients,
            Steps = payload.Steps
        };

        var storedRecipe = _recipeRepository.Replace(currentSlug, updatedRecipe);
        return storedRecipe is null ? null : MapToResponse(storedRecipe);
    }

    public bool DeleteRecipe(string slug) => _recipeRepository.Delete(slug);

    private static bool MatchesFilters(Recipe recipe, string? normalizedSearch, string? normalizedCategory) =>
        (string.IsNullOrWhiteSpace(normalizedSearch) ||
         recipe.Title.Contains(normalizedSearch, StringComparison.OrdinalIgnoreCase) ||
         recipe.Description.Contains(normalizedSearch, StringComparison.OrdinalIgnoreCase)) &&
        (string.IsNullOrWhiteSpace(normalizedCategory) ||
         string.Equals(recipe.Category, normalizedCategory, StringComparison.OrdinalIgnoreCase));

    private static RecipePayload ValidateAndNormalizePayload(
        string title,
        string slug,
        string description,
        string category,
        int prepTimeMinutes,
        int servings,
        string imageUrl,
        bool isPublished,
        IReadOnlyList<string> ingredients,
        IReadOnlyList<string> steps)
    {
        var normalizedTitle = title.Trim();
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var normalizedDescription = description.Trim();
        var normalizedCategory = category.Trim();
        var normalizedImageUrl = imageUrl.Trim();
        var normalizedIngredients = ingredients
            .Select(ingredient => ingredient.Trim())
            .Where(ingredient => !string.IsNullOrWhiteSpace(ingredient))
            .ToList();
        var normalizedSteps = steps
            .Select(step => step.Trim())
            .Where(step => !string.IsNullOrWhiteSpace(step))
            .ToList();

        if (string.IsNullOrWhiteSpace(normalizedTitle))
        {
            throw new ArgumentException("Title is required.");
        }

        if (string.IsNullOrWhiteSpace(normalizedSlug))
        {
            throw new ArgumentException("Slug is required.");
        }

        if (string.IsNullOrWhiteSpace(normalizedDescription) ||
            string.IsNullOrWhiteSpace(normalizedCategory) ||
            string.IsNullOrWhiteSpace(normalizedImageUrl) ||
            prepTimeMinutes <= 0 ||
            servings <= 0 ||
            normalizedIngredients.Count == 0 ||
            normalizedSteps.Count == 0)
        {
            throw new ArgumentException("Recipe payload is incomplete.");
        }

        return new RecipePayload(
            normalizedTitle,
            normalizedSlug,
            normalizedDescription,
            normalizedCategory,
            prepTimeMinutes,
            servings,
            normalizedImageUrl,
            isPublished,
            normalizedIngredients,
            normalizedSteps);
    }

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

    private sealed record RecipePayload(
        string Title,
        string Slug,
        string Description,
        string Category,
        int PrepTimeMinutes,
        int Servings,
        string ImageUrl,
        bool IsPublished,
        IReadOnlyList<string> Ingredients,
        IReadOnlyList<string> Steps);
}
