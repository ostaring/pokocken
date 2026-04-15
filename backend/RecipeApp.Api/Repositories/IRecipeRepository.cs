using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public interface IRecipeRepository
{
    IReadOnlyList<Recipe> GetAll();
    Recipe? GetBySlug(string slug);
    Recipe Add(Recipe recipe);
    Recipe? Replace(string currentSlug, Recipe recipe);
}
