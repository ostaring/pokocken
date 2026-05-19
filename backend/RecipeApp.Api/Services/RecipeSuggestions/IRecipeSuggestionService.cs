using RecipeApp.Api.Contracts;

namespace RecipeApp.Api.Services;

public interface IRecipeSuggestionService
{
    RecipeSuggestionResponse CreateSuggestions(RecipeSuggestionRequest request);
}
