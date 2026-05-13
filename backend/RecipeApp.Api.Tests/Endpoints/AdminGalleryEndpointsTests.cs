using System.Net;
using System.Net.Http.Json;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Tests.Testing;
using Xunit;

namespace RecipeApp.Api.Tests.Endpoints;

public sealed class AdminGalleryEndpointsTests : IClassFixture<RecipeApiFactory>
{
    private readonly RecipeApiFactory _factory;

    public AdminGalleryEndpointsTests(RecipeApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetGallery_ReturnsSeededImages()
    {
        using var client = _factory.CreateClient();

        var images = await client.GetFromJsonAsync<List<GalleryImageResponse>>("/api/gallery");

        Assert.NotNull(images);
        Assert.NotEmpty(images);
        Assert.All(images!, image => Assert.False(string.IsNullOrWhiteSpace(image.AltText)));
    }

    [Fact]
    public async Task GetAdminGallery_ReturnsUnauthorizedWithoutAuthentication()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/admin/gallery");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAdminGallery_ReturnsImagesWhenAuthorized()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var images = await client.GetFromJsonAsync<List<GalleryImageResponse>>("/api/admin/gallery");

        Assert.NotNull(images);
        Assert.NotEmpty(images);
    }

    [Fact]
    public async Task PostAdminGallery_ReturnsCreatedWhenAuthorized()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/admin/gallery", new CreateGalleryImageRequest(
            "https://example.com/gallery/pasta.jpg",
            "Tallrik med nygjord pasta och örter."));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var createdImage = await response.Content.ReadFromJsonAsync<GalleryImageResponse>();
        Assert.NotNull(createdImage);
        Assert.Equal("https://example.com/gallery/pasta.jpg", createdImage!.ImageUrl);
        Assert.Equal($"/api/admin/gallery/{createdImage.Id}", response.Headers.Location?.OriginalString);
    }

    [Fact]
    public async Task PostAdminGallery_ReturnsBadRequestForInvalidPayload()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/admin/gallery", new CreateGalleryImageRequest(
            "not-a-url",
            " "));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DeleteAdminGallery_ReturnsNoContentForExistingImage()
    {
        using var client = await CreateAuthenticatedClientAsync();
        var existingImages = await client.GetFromJsonAsync<List<GalleryImageResponse>>("/api/admin/gallery");
        var imageId = Assert.Single(existingImages!.Take(1)).Id;

        var response = await client.DeleteAsync($"/api/admin/gallery/{imageId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeleteAdminGallery_ReturnsNotFoundForMissingImage()
    {
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.DeleteAsync($"/api/admin/gallery/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = _factory.WithWebHostBuilder(_ => { }).CreateClient();
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginAdminRequest("admin", "admin123"));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        return client;
    }
}
