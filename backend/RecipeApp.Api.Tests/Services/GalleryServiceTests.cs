using Microsoft.Extensions.Logging.Abstractions;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Services;
using Xunit;

namespace RecipeApp.Api.Tests.Services;

public sealed class GalleryServiceTests
{
    [Fact]
    public void GetAllImages_ReturnsSeededImages()
    {
        var service = CreateService(new InMemoryGalleryRepository());

        var images = service.GetAllImages();

        Assert.NotEmpty(images);
    }

    [Fact]
    public void CreateImage_AddsNewGalleryImage()
    {
        var repository = new InMemoryGalleryRepository();
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
        var service = CreateService(new InMemoryGalleryRepository());

        var action = () => service.CreateImage(new CreateGalleryImageRequest(
            "/images/local-food.jpg",
            "Relativ bildsökväg."));

        var exception = Assert.Throws<ArgumentException>(action);
        Assert.Contains("absolute URL", exception.Message);
    }

    [Fact]
    public void DeleteImage_ReturnsFalseWhenImageDoesNotExist()
    {
        var service = CreateService(new InMemoryGalleryRepository());

        var deleted = service.DeleteImage(Guid.NewGuid());

        Assert.False(deleted);
    }

    private static GalleryService CreateService(IGalleryRepository repository) =>
        new(repository, TimeProvider.System, NullLogger<GalleryService>.Instance);
}
