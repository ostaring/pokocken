using RecipeApp.Api.Contracts;

namespace RecipeApp.Api.Services;

public interface IGalleryService
{
    IReadOnlyList<GalleryImageResponse> GetAllImages();
    GalleryImageResponse CreateImage(CreateGalleryImageRequest request);
    bool DeleteImage(Guid id);
}
