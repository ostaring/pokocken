using System.Text.Json;
using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public sealed class FileRecipeRepository : IRecipeRepository
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true
    };

    private readonly string _filePath;
    private readonly object _syncRoot = new();
    private readonly List<Recipe> _recipes;

    public FileRecipeRepository(string filePath)
    {
        _filePath = Path.GetFullPath(filePath);
        _recipes = LoadRecipes();
    }

    public IReadOnlyList<Recipe> GetAll()
    {
        lock (_syncRoot)
        {
            return _recipes
                .Select(CloneRecipe)
                .ToList();
        }
    }

    public Recipe? GetBySlug(string slug)
    {
        lock (_syncRoot)
        {
            var recipe = _recipes.FirstOrDefault(existingRecipe =>
                string.Equals(existingRecipe.Slug, slug, StringComparison.OrdinalIgnoreCase));

            return recipe is null ? null : CloneRecipe(recipe);
        }
    }

    public Recipe Add(Recipe recipe)
    {
        lock (_syncRoot)
        {
            var storedRecipe = CloneRecipe(recipe);
            _recipes.Add(storedRecipe);
            SaveRecipes();
            return CloneRecipe(storedRecipe);
        }
    }

    public Recipe? Replace(string currentSlug, Recipe recipe)
    {
        lock (_syncRoot)
        {
            var index = _recipes.FindIndex(existingRecipe =>
                string.Equals(existingRecipe.Slug, currentSlug, StringComparison.OrdinalIgnoreCase));

            if (index < 0)
            {
                return null;
            }

            var storedRecipe = CloneRecipe(recipe);
            _recipes[index] = storedRecipe;
            SaveRecipes();
            return CloneRecipe(storedRecipe);
        }
    }

    public bool Delete(string slug)
    {
        lock (_syncRoot)
        {
            var index = _recipes.FindIndex(existingRecipe =>
                string.Equals(existingRecipe.Slug, slug, StringComparison.OrdinalIgnoreCase));

            if (index < 0)
            {
                return false;
            }

            _recipes.RemoveAt(index);
            SaveRecipes();
            return true;
        }
    }

    private List<Recipe> LoadRecipes()
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);

        if (!File.Exists(_filePath))
        {
            var seededRecipes = RecipeSeedData.CreateRecipes();
            SaveRecipes(seededRecipes);
            return seededRecipes;
        }

        using var stream = File.OpenRead(_filePath);
        var recipes = JsonSerializer.Deserialize<List<Recipe>>(stream, SerializerOptions);

        if (recipes is null || recipes.Count == 0)
        {
            var seededRecipes = RecipeSeedData.CreateRecipes();
            SaveRecipes(seededRecipes);
            return seededRecipes;
        }

        return recipes
            .Select(CloneRecipe)
            .ToList();
    }

    private void SaveRecipes() => SaveRecipes(_recipes);

    private void SaveRecipes(IReadOnlyList<Recipe> recipes)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
        var serializedRecipes = recipes
            .Select(CloneRecipe)
            .ToList();

        var json = JsonSerializer.Serialize(serializedRecipes, SerializerOptions);
        File.WriteAllText(_filePath, json);
    }

    private static Recipe CloneRecipe(Recipe recipe) => recipe with
    {
        Ingredients = [.. recipe.Ingredients],
        Steps = [.. recipe.Steps]
    };
}
