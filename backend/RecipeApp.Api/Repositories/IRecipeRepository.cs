using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public interface IRecipeRepository
{
    IReadOnlyList<Recipe> GetAll();
    Recipe? GetBySlug(string slug);
}
