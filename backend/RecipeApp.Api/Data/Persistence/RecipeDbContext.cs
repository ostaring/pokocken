using Microsoft.EntityFrameworkCore;

namespace RecipeApp.Api.Data;

public sealed class RecipeDbContext : DbContext
{
    public RecipeDbContext(DbContextOptions<RecipeDbContext> options)
        : base(options)
    {
    }

    public DbSet<RecipeEntity> Recipes => Set<RecipeEntity>();
    public DbSet<GalleryImageEntity> GalleryImages => Set<GalleryImageEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var recipe = modelBuilder.Entity<RecipeEntity>();

        recipe.ToTable("Recipes");
        recipe.HasKey(entity => entity.Id);
        recipe.Property(entity => entity.Title).HasMaxLength(200).IsRequired();
        recipe.Property(entity => entity.Slug).HasMaxLength(200).IsRequired();
        recipe.HasIndex(entity => entity.Slug).IsUnique();
        recipe.Property(entity => entity.Description).HasMaxLength(2000).IsRequired();
        recipe.Property(entity => entity.Category).HasMaxLength(100).IsRequired();
        recipe.Property(entity => entity.ImageUrl).HasMaxLength(2000).IsRequired();
        recipe.Property(entity => entity.IngredientsJson).IsRequired();
        recipe.Property(entity => entity.StepsJson).IsRequired();

        var galleryImage = modelBuilder.Entity<GalleryImageEntity>();

        galleryImage.ToTable("GalleryImages");
        galleryImage.HasKey(entity => entity.Id);
        galleryImage.Property(entity => entity.ImageUrl).HasMaxLength(2000).IsRequired();
        galleryImage.Property(entity => entity.AltText).HasMaxLength(400).IsRequired();
        galleryImage.Property(entity => entity.CreatedAtUtc).IsRequired();
    }
}
