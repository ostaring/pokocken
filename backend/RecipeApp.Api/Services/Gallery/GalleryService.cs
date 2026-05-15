using RecipeApp.Api.Contracts;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;

namespace RecipeApp.Api.Services;

public sealed class GalleryService : IGalleryService
{
    private readonly IGalleryRepository _galleryRepository;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<GalleryService> _logger;

    public GalleryService(
        IGalleryRepository galleryRepository,
        TimeProvider timeProvider,
        ILogger<GalleryService> logger)
    {
        _galleryRepository = galleryRepository;
        _timeProvider = timeProvider;
        _logger = logger;
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
            _logger.LogWarning("Rejected gallery image create because image URL was empty");
            throw new ArgumentException("Image URL is required.");
        }

        if (!Uri.TryCreate(normalizedImageUrl, UriKind.Absolute, out var parsedImageUrl) ||
            (parsedImageUrl.Scheme != Uri.UriSchemeHttp &&
             parsedImageUrl.Scheme != Uri.UriSchemeHttps))
        {
            _logger.LogWarning("Rejected gallery image create because image URL was invalid");
            throw new ArgumentException("Image URL must be an absolute HTTP(S) URL.");
        }

        if (string.IsNullOrWhiteSpace(normalizedAltText))
        {
            _logger.LogWarning("Rejected gallery image create because alt text was empty");
            throw new ArgumentException("Alt text is required.");
        }

        var image = new GalleryImage
        {
            Id = Guid.NewGuid(),
            ImageUrl = normalizedImageUrl,
            AltText = normalizedAltText,
            CreatedAtUtc = _timeProvider.GetUtcNow()
        };

        var createdImage = _galleryRepository.Add(image);
        _logger.LogInformation("Created gallery image {GalleryImageId}", createdImage.Id);
        return MapToResponse(createdImage);
    }

    public bool DeleteImage(Guid id)
    {
        var deleted = _galleryRepository.Delete(id);
        if (deleted)
        {
            _logger.LogInformation("Deleted gallery image {GalleryImageId}", id);
        }
        else
        {
            _logger.LogWarning("Gallery image delete requested for missing id {GalleryImageId}", id);
        }

        return deleted;
    }

    private static GalleryImageResponse MapToResponse(GalleryImage image) =>
        new(image.Id, image.ImageUrl, image.AltText, image.CreatedAtUtc);
}
