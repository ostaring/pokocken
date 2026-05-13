using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public sealed class InMemoryGalleryRepository : IGalleryRepository
{
    private readonly List<GalleryImage> _images = GallerySeedData.CreateImages();

    public IReadOnlyList<GalleryImage> GetAll() => _images
        .OrderByDescending(image => image.CreatedAtUtc)
        .ToList();

    public GalleryImage? GetById(Guid id) => _images.FirstOrDefault(image => image.Id == id);

    public GalleryImage Add(GalleryImage image)
    {
        _images.Add(image);
        return image;
    }

    public bool Delete(Guid id)
    {
        var index = _images.FindIndex(image => image.Id == id);
        if (index < 0)
        {
            return false;
        }

        _images.RemoveAt(index);
        return true;
    }
}
