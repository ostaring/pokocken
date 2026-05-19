namespace RecipeApp.Api.Contracts;

public sealed record RecipeSuggestionResponse(
    IReadOnlyList<RecipeSuggestionItemResponse> Suggestions);

public sealed record RecipeSuggestionItemResponse(
    string Title,
    string Description,
    IReadOnlyList<string> UsedIngredients,
    IReadOnlyList<string> MissingIngredients,
    IReadOnlyList<string> Steps);
