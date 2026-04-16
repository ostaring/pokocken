using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public sealed class InMemoryRecipeRepository : IRecipeRepository
{
    private readonly List<Recipe> _recipes = RecipeSeedData.CreateRecipes();

    public IReadOnlyList<Recipe> GetAll() => _recipes;

    public Recipe? GetBySlug(string slug) =>
        _recipes.FirstOrDefault(recipe => string.Equals(recipe.Slug, slug, StringComparison.OrdinalIgnoreCase));

    public Recipe Add(Recipe recipe)
    {
        _recipes.Add(recipe);
        return recipe;
    }

    public Recipe? Replace(string currentSlug, Recipe recipe)
    {
        var index = _recipes.FindIndex(existingRecipe =>
            string.Equals(existingRecipe.Slug, currentSlug, StringComparison.OrdinalIgnoreCase));

        if (index < 0)
        {
            return null;
        }

        _recipes[index] = recipe;
        return recipe;
    }

    public bool Delete(string slug)
    {
        var index = _recipes.FindIndex(existingRecipe =>
            string.Equals(existingRecipe.Slug, slug, StringComparison.OrdinalIgnoreCase));

        if (index < 0)
        {
            return false;
        }

        _recipes.RemoveAt(index);
        return true;
    }
}
