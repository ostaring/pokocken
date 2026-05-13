namespace RecipeApp.Api.Contracts;

public sealed record GalleryImageResponse(
    Guid Id,
    string ImageUrl,
    string AltText,
    DateTimeOffset CreatedAtUtc);
