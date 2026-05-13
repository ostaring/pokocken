namespace RecipeApp.Api.Domain;

public sealed record GalleryImage
{
    public required Guid Id { get; init; }
    public required string ImageUrl { get; init; }
    public required string AltText { get; init; }
    public required DateTimeOffset CreatedAtUtc { get; init; }
}
