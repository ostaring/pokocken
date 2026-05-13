using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public static class GallerySeedData
{
    private static readonly IReadOnlyList<GalleryImage> SeedImages =
    [
        new GalleryImage
        {
            Id = Guid.Parse("92D5EA1C-6104-4D4E-B22E-8D4F9E9D21A1"),
            ImageUrl = "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80",
            AltText = "Brynta smörpannkakor med bär på ett serveringsfat.",
            CreatedAtUtc = new DateTimeOffset(2026, 05, 01, 08, 30, 00, TimeSpan.Zero)
        },
        new GalleryImage
        {
            Id = Guid.Parse("B4E7C9A7-FB6E-44F5-B518-0D2C1D4F6D42"),
            ImageUrl = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
            AltText = "Rostad tomatpasta toppad med basilika och parmesan.",
            CreatedAtUtc = new DateTimeOffset(2026, 05, 02, 11, 45, 00, TimeSpan.Zero)
        },
        new GalleryImage
        {
            Id = Guid.Parse("E165D9A0-26D7-48E9-A8D8-44AA5F421893"),
            ImageUrl = "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
            AltText = "Matig skål med kyckling, ris och gröna tillbehör.",
            CreatedAtUtc = new DateTimeOffset(2026, 05, 03, 12, 10, 00, TimeSpan.Zero)
        },
        new GalleryImage
        {
            Id = Guid.Parse("0E2B7D14-A0DF-4771-B0B1-9A57A7615A24"),
            ImageUrl = "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=1200&q=80",
            AltText = "Mörk chokladmousse serverad i glas med flingsalt ovanpå.",
            CreatedAtUtc = new DateTimeOffset(2026, 05, 04, 19, 20, 00, TimeSpan.Zero)
        },
        new GalleryImage
        {
            Id = Guid.Parse("A9E7DAA8-F96C-456D-B063-651EE4CCBD65"),
            ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
            AltText = "Krispiga kikärtor i skål med lime och örter.",
            CreatedAtUtc = new DateTimeOffset(2026, 05, 05, 14, 05, 00, TimeSpan.Zero)
        }
    ];

    public static List<GalleryImage> CreateImages() => SeedImages
        .Select(image => image with { })
        .ToList();
}
