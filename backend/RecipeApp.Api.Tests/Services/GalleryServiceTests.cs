using Microsoft.Extensions.Logging.Abstractions;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Services;
using Xunit;

namespace RecipeApp.Api.Tests.Services;

public sealed class GalleryServiceTests
{
    [Fact]
    public void GetAllImages_ReturnsSeededImages()
    {
        var service = CreateService(new TestGalleryRepository());

        var images = service.GetAllImages();

        Assert.NotEmpty(images);
    }

    [Fact]
    public void CreateImage_AddsNewGalleryImage()
    {
        var repository = new TestGalleryRepository();
        var service = CreateService(repository);

        var createdImage = service.CreateImage(new CreateGalleryImageRequest(
            "https://example.com/gallery/new-image.jpg",
            "Tallrik med nybakad focaccia."));

        Assert.Contains(repository.GetAll(), image => image.Id == createdImage.Id);
        Assert.Equal("Tallrik med nybakad focaccia.", createdImage.AltText);
    }

    [Fact]
    public void CreateImage_ThrowsForRelativeUrl()
    {
        var service = CreateService(new TestGalleryRepository());

        var action = () => service.CreateImage(new CreateGalleryImageRequest(
            "/images/local-food.jpg",
            "Relativ bildsökväg."));

        var exception = Assert.Throws<ArgumentException>(action);
        Assert.Contains("absolute HTTP(S) URL", exception.Message);
    }

    [Fact]
    public void DeleteImage_ReturnsFalseWhenImageDoesNotExist()
    {
        var service = CreateService(new TestGalleryRepository());

        var deleted = service.DeleteImage(Guid.NewGuid());

        Assert.False(deleted);
    }

    private static GalleryService CreateService(IGalleryRepository repository) =>
        new(repository, TimeProvider.System, NullLogger<GalleryService>.Instance);

    private sealed class TestGalleryRepository : IGalleryRepository
    {
        private readonly List<GalleryImage> _images = GallerySeedData.CreateImages().ToList();

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
            var image = GetById(id);
            return image is not null && _images.Remove(image);
        }
    }
}
