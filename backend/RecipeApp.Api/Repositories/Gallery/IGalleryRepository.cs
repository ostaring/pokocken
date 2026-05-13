using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public interface IGalleryRepository
{
    IReadOnlyList<GalleryImage> GetAll();
    GalleryImage? GetById(Guid id);
    GalleryImage Add(GalleryImage image);
    bool Delete(Guid id);
}
