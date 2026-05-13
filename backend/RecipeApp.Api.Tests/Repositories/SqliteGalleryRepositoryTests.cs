using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.EntityFrameworkCore;
using RecipeApp.Api.Data;
using RecipeApp.Api.Domain;
using RecipeApp.Api.Repositories;
using Xunit;

namespace RecipeApp.Api.Tests.Repositories;

public sealed class SqliteGalleryRepositoryTests : IDisposable
{
    private readonly string _tempDirectory;
    private readonly string _databasePath;

    public SqliteGalleryRepositoryTests()
    {
        _tempDirectory = Path.Combine(Path.GetTempPath(), "recipe-app-sqlite-gallery-tests", Guid.NewGuid().ToString("N"));
        _databasePath = Path.Combine(_tempDirectory, "gallery.db");
    }

    [Fact]
    public async Task InitializeAsync_SeedsGalleryImagesWhenDatabaseIsEmpty()
    {
        await using (var dbContext = CreateDbContext())
        {
            var initializer = new RecipeDbInitializer(dbContext, NullLogger<RecipeDbInitializer>.Instance);
            await initializer.InitializeAsync();
        }

        await using var verificationContext = CreateDbContext();
        var repository = new SqliteGalleryRepository(verificationContext);
        var images = repository.GetAll();

        Assert.NotEmpty(images);
    }

    [Fact]
    public async Task Add_PersistsGalleryImageForANewRepositoryInstance()
    {
        await InitializeDatabaseAsync();

        var image = new GalleryImage
        {
            Id = Guid.NewGuid(),
            ImageUrl = "https://example.com/gallery/new-image.jpg",
            AltText = "Ny pastarätt på ett serveringsfat.",
            CreatedAtUtc = new DateTimeOffset(2026, 05, 13, 10, 00, 00, TimeSpan.Zero)
        };

        await using (var dbContext = CreateDbContext())
        {
            var repository = new SqliteGalleryRepository(dbContext);
            repository.Add(image);
        }

        await using var verificationContext = CreateDbContext();
        var reloadedRepository = new SqliteGalleryRepository(verificationContext);
        var storedImage = reloadedRepository.GetById(image.Id);

        Assert.NotNull(storedImage);
        Assert.Equal(image.AltText, storedImage!.AltText);
    }

    [Fact]
    public async Task Delete_RemovesGalleryImageFromTheDatabase()
    {
        await InitializeDatabaseAsync();

        Guid imageId;

        await using (var dbContext = CreateDbContext())
        {
            var repository = new SqliteGalleryRepository(dbContext);
            imageId = repository.GetAll().First().Id;
            var deleted = repository.Delete(imageId);
            Assert.True(deleted);
        }

        await using var verificationContext = CreateDbContext();
        var reloadedRepository = new SqliteGalleryRepository(verificationContext);
        Assert.Null(reloadedRepository.GetById(imageId));
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_tempDirectory))
            {
                Directory.Delete(_tempDirectory, recursive: true);
            }
        }
        catch (IOException)
        {
        }
        catch (UnauthorizedAccessException)
        {
        }
    }

    private async Task InitializeDatabaseAsync()
    {
        await using var dbContext = CreateDbContext();
        var initializer = new RecipeDbInitializer(dbContext, NullLogger<RecipeDbInitializer>.Instance);
        await initializer.InitializeAsync();
    }

    private RecipeDbContext CreateDbContext()
    {
        Directory.CreateDirectory(_tempDirectory);
        var options = new DbContextOptionsBuilder<RecipeDbContext>()
            .UseSqlite($"Data Source={_databasePath}")
            .Options;

        return new RecipeDbContext(options);
    }
}
