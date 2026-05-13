using RecipeApp.Api.Contracts;

namespace RecipeApp.Api.Services;

public interface IRecipeService
{
    IReadOnlyList<RecipeResponse> GetPublishedRecipes(string? search, string? category);
    RecipeResponse? GetPublishedRecipeBySlug(string slug);
    IReadOnlyList<RecipeResponse> GetAllRecipes(string? search, string? category);
    RecipeResponse? GetRecipeBySlug(string slug);
    RecipeResponse CreateRecipe(CreateRecipeRequest request);
    RecipeResponse? UpdateRecipe(string currentSlug, UpdateRecipeRequest request);
    bool DeleteRecipe(string slug);
}
