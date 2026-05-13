namespace RecipeApp.Api.Contracts;

public sealed record CreateGalleryImageRequest(
    string ImageUrl,
    string AltText);
