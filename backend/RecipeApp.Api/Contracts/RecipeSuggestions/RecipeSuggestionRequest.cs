namespace RecipeApp.Api.Contracts;

public sealed record RecipeSuggestionRequest(
    IReadOnlyList<string> Ingredients,
    int Servings,
    int MaxTimeMinutes);
