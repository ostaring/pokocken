using RecipeApp.Api.Contracts;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;

namespace RecipeApp.Api.Services;

public sealed class GalleryService
{
    private readonly IGalleryRepository _galleryRepository;
    private readonly TimeProvider _timeProvider;

    public GalleryService(IGalleryRepository galleryRepository, TimeProvider timeProvider)
    {
        _galleryRepository = galleryRepository;
        _timeProvider = timeProvider;
    }

    public IReadOnlyList<GalleryImageResponse> GetAllImages() => _galleryRepository
        .GetAll()
        .Select(MapToResponse)
        .ToList();

    public GalleryImageResponse CreateImage(CreateGalleryImageRequest request)
    {
        var normalizedImageUrl = request.ImageUrl.Trim();
        var normalizedAltText = request.AltText.Trim();

        if (string.IsNullOrWhiteSpace(normalizedImageUrl))
        {
            throw new ArgumentException("Image URL is required.");
        }

        if (!Uri.TryCreate(normalizedImageUrl, UriKind.Absolute, out _))
        {
            throw new ArgumentException("Image URL must be an absolute URL.");
        }

        if (string.IsNullOrWhiteSpace(normalizedAltText))
        {
            throw new ArgumentException("Alt text is required.");
        }

        var image = new GalleryImage
        {
            Id = Guid.NewGuid(),
            ImageUrl = normalizedImageUrl,
            AltText = normalizedAltText,
            CreatedAtUtc = _timeProvider.GetUtcNow()
        };

        return MapToResponse(_galleryRepository.Add(image));
    }

    public bool DeleteImage(Guid id) => _galleryRepository.Delete(id);

    private static GalleryImageResponse MapToResponse(GalleryImage image) =>
        new(image.Id, image.ImageUrl, image.AltText, image.CreatedAtUtc);
}
