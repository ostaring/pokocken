namespace RecipeApp.Api.Contracts;

public sealed record CreateRecipeRequest(
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
