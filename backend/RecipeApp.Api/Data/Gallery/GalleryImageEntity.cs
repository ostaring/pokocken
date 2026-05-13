namespace RecipeApp.Api.Data;

public sealed class GalleryImageEntity
{
    public Guid Id { get; set; }
    public required string ImageUrl { get; set; }
    public required string AltText { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}
