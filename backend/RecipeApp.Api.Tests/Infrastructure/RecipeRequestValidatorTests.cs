using RecipeApp.Api.Contracts;
using RecipeApp.Api.Infrastructure;
using Xunit;

namespace RecipeApp.Api.Tests.Infrastructure;

public sealed class RecipeRequestValidatorTests
{
    [Fact]
    public void Validate_ReturnsFieldErrorsForInvalidCreateRequest()
    {
        var errors = RecipeRequestValidator.Validate(new CreateRecipeRequest(
            " ",
            "Bad Slug",
            "",
            "",
            0,
            0,
            "not-a-url",
            false,
            [],
            [" "]));

        Assert.Equal("Title is required.", errors["title"].Single());
        Assert.Equal("Slug must contain lowercase letters, digits and hyphens only.", errors["slug"].Single());
        Assert.Equal("Description is required.", errors["description"].Single());
        Assert.Equal("Category is required.", errors["category"].Single());
        Assert.Equal("Prep time must be greater than zero.", errors["prepTimeMinutes"].Single());
        Assert.Equal("Servings must be greater than zero.", errors["servings"].Single());
        Assert.Equal("Image URL must be an absolute URL.", errors["imageUrl"].Single());
        Assert.Equal("At least one ingredient is required.", errors["ingredients"].Single());
        Assert.Equal("At least one step is required.", errors["steps"].Single());
    }

    [Fact]
    public void Validate_ReturnsNoErrorsForValidUpdateRequest()
    {
        var errors = RecipeRequestValidator.Validate(new UpdateRecipeRequest(
            "Potato gratin",
            "potato-gratin",
            "Creamy potatoes baked until golden.",
            "Dinner",
            55,
            6,
            "https://example.com/gratin.jpg",
            true,
            ["Potatoes", "Cream"],
            ["Slice potatoes.", "Bake."]));

        Assert.Empty(errors);
    }
}
