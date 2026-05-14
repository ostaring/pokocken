using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Tests.Testing;
using Xunit;

namespace RecipeApp.Api.Tests.Repositories;

public sealed class EfGalleryRepositoryTests : IClassFixture<PostgresTestDatabase>, IAsyncLifetime
{
    private readonly PostgresTestDatabase _database;

    public EfGalleryRepositoryTests(PostgresTestDatabase database)
    {
        _database = database;
    }

    public Task InitializeAsync() => _database.ResetAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task InitializeAsync_SeedsGalleryImagesWhenDatabaseIsEmpty()
    {
        await using var verificationContext = _database.CreateDbContext();
        var repository = new EfGalleryRepository(verificationContext);
        var images = repository.GetAll();

        Assert.NotEmpty(images);
    }

    [Fact]
    public async Task Add_PersistsGalleryImageForANewRepositoryInstance()
    {
        var image = new GalleryImage
        {
            Id = Guid.NewGuid(),
            ImageUrl = "https://example.com/gallery/new-image.jpg",
            AltText = "Ny pastaratt pa ett serveringsfat.",
            CreatedAtUtc = new DateTimeOffset(2026, 05, 13, 10, 00, 00, TimeSpan.Zero)
        };

        await using (var dbContext = _database.CreateDbContext())
        {
            var repository = new EfGalleryRepository(dbContext);
            repository.Add(image);
        }

        await using var verificationContext = _database.CreateDbContext();
        var reloadedRepository = new EfGalleryRepository(verificationContext);
        var storedImage = reloadedRepository.GetById(image.Id);

        Assert.NotNull(storedImage);
        Assert.Equal(image.AltText, storedImage!.AltText);
    }

    [Fact]
    public async Task Delete_RemovesGalleryImageFromTheDatabase()
    {
        Guid imageId;

        await using (var dbContext = _database.CreateDbContext())
        {
            var repository = new EfGalleryRepository(dbContext);
            imageId = repository.GetAll().First().Id;
            var deleted = repository.Delete(imageId);
            Assert.True(deleted);
        }

        await using var verificationContext = _database.CreateDbContext();
        var reloadedRepository = new EfGalleryRepository(verificationContext);
        Assert.Null(reloadedRepository.GetById(imageId));
    }
}
