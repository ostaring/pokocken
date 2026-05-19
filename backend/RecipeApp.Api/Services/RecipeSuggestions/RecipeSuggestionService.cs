using RecipeApp.Api.Contracts;

namespace RecipeApp.Api.Services;

public sealed class RecipeSuggestionService : IRecipeSuggestionService
{
    public RecipeSuggestionResponse CreateSuggestions(RecipeSuggestionRequest request) =>
        new([]);
}
