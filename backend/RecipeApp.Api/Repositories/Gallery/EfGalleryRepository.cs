using Microsoft.EntityFrameworkCore;
using RecipeApp.Api.Data;
using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public sealed class EfGalleryRepository : IGalleryRepository
{
    private readonly RecipeDbContext _dbContext;

    public EfGalleryRepository(RecipeDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IReadOnlyList<GalleryImage> GetAll() => _dbContext.GalleryImages
        .AsNoTracking()
        .ToList()
        .Select(MapToDomain)
        .OrderByDescending(image => image.CreatedAtUtc)
        .ToList();

    public GalleryImage? GetById(Guid id)
    {
        var image = _dbContext.GalleryImages
            .AsNoTracking()
            .FirstOrDefault(existingImage => existingImage.Id == id);

        return image is null ? null : MapToDomain(image);
    }

    public GalleryImage Add(GalleryImage image)
    {
        var entity = GalleryDbMapper.MapToEntity(image);
        _dbContext.GalleryImages.Add(entity);
        _dbContext.SaveChanges();
        return MapToDomain(entity);
    }

    public bool Delete(Guid id)
    {
        var entity = _dbContext.GalleryImages.FirstOrDefault(existingImage => existingImage.Id == id);
        if (entity is null)
        {
            return false;
        }

        _dbContext.GalleryImages.Remove(entity);
        _dbContext.SaveChanges();
        return true;
    }

    private static GalleryImage MapToDomain(GalleryImageEntity entity) =>
        new()
        {
            Id = entity.Id,
            ImageUrl = entity.ImageUrl,
            AltText = entity.AltText,
            CreatedAtUtc = entity.CreatedAtUtc
        };
}
