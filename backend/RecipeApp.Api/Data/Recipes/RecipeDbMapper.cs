using System.Text.Json;
using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Data;

internal static class RecipeDbMapper
{
    private static readonly JsonSerializerOptions SerializerOptions = new();

    internal static RecipeEntity MapToEntity(Recipe recipe) =>
        new()
        {
            Id = recipe.Id,
            Title = recipe.Title,
            Slug = recipe.Slug,
            Description = recipe.Description,
            Category = recipe.Category,
            PrepTimeMinutes = recipe.PrepTimeMinutes,
            Servings = recipe.Servings,
            ImageUrl = recipe.ImageUrl,
            IsPublished = recipe.IsPublished,
            IngredientsJson = SerializeList(recipe.Ingredients),
            StepsJson = SerializeList(recipe.Steps)
        };

    internal static Recipe MapToDomain(RecipeEntity entity) =>
        new()
        {
            Id = entity.Id,
            Title = entity.Title,
            Slug = entity.Slug,
            Description = entity.Description,
            Category = entity.Category,
            PrepTimeMinutes = entity.PrepTimeMinutes,
            Servings = entity.Servings,
            ImageUrl = entity.ImageUrl,
            IsPublished = entity.IsPublished,
            Ingredients = DeserializeList(entity.IngredientsJson),
            Steps = DeserializeList(entity.StepsJson)
        };

    internal static string SerializeList(IReadOnlyList<string> values) =>
        JsonSerializer.Serialize(values, SerializerOptions);

    private static IReadOnlyList<string> DeserializeList(string json) =>
        JsonSerializer.Deserialize<List<string>>(json, SerializerOptions) ?? [];
}
