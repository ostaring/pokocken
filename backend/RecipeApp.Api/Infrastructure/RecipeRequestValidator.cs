using System.Text.RegularExpressions;
using RecipeApp.Api.Contracts;

namespace RecipeApp.Api.Infrastructure;

public static partial class RecipeRequestValidator
{
    public static Dictionary<string, string[]> Validate(CreateRecipeRequest request) =>
        ValidateCore(
            request.Title,
            request.Slug,
            request.Description,
            request.Category,
            request.PrepTimeMinutes,
            request.Servings,
            request.ImageUrl,
            request.Ingredients,
            request.Steps);

    public static Dictionary<string, string[]> Validate(UpdateRecipeRequest request) =>
        ValidateCore(
            request.Title,
            request.Slug,
            request.Description,
            request.Category,
            request.PrepTimeMinutes,
            request.Servings,
            request.ImageUrl,
            request.Ingredients,
            request.Steps);

    private static Dictionary<string, string[]> ValidateCore(
        string title,
        string slug,
        string description,
        string category,
        int prepTimeMinutes,
        int servings,
        string imageUrl,
        IReadOnlyList<string> ingredients,
        IReadOnlyList<string> steps)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);
        AddIfInvalid(errors, "title", string.IsNullOrWhiteSpace(title), "Title is required.");
        AddIfInvalid(errors, "slug", string.IsNullOrWhiteSpace(slug), "Slug is required.");
        AddIfInvalid(errors, "description", string.IsNullOrWhiteSpace(description), "Description is required.");
        AddIfInvalid(errors, "category", string.IsNullOrWhiteSpace(category), "Category is required.");
        AddIfInvalid(errors, "imageUrl", string.IsNullOrWhiteSpace(imageUrl), "Image URL is required.");
        AddIfInvalid(errors, "prepTimeMinutes", prepTimeMinutes <= 0, "Prep time must be greater than zero.");
        AddIfInvalid(errors, "servings", servings <= 0, "Servings must be greater than zero.");

        if (!string.IsNullOrWhiteSpace(slug) && !SlugPattern().IsMatch(slug.Trim().ToLowerInvariant()))
        {
            errors["slug"] = ["Slug must contain lowercase letters, digits and hyphens only."];
        }

        if (!string.IsNullOrWhiteSpace(imageUrl) &&
            !Uri.TryCreate(imageUrl.Trim(), UriKind.Absolute, out var parsedImageUrl))
        {
            errors["imageUrl"] = ["Image URL must be an absolute URL."];
        }

        if (!HasValues(ingredients))
        {
            errors["ingredients"] = ["At least one ingredient is required."];
        }

        if (!HasValues(steps))
        {
            errors["steps"] = ["At least one step is required."];
        }

        return errors;
    }

    private static void AddIfInvalid(
        IDictionary<string, string[]> errors,
        string field,
        bool isInvalid,
        string errorMessage)
    {
        if (isInvalid)
        {
            errors[field] = [errorMessage];
        }
    }

    private static bool HasValues(IReadOnlyList<string> values) =>
        values.Any(value => !string.IsNullOrWhiteSpace(value));

    [GeneratedRegex("^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    private static partial Regex SlugPattern();
}
