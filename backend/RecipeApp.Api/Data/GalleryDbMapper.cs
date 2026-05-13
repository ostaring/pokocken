using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Data;

internal static class GalleryDbMapper
{
    internal static GalleryImageEntity MapToEntity(GalleryImage image) =>
        new()
        {
            Id = image.Id,
            ImageUrl = image.ImageUrl,
            AltText = image.AltText,
            CreatedAtUtc = image.CreatedAtUtc
        };
}
