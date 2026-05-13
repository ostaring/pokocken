using System.Text.Json;
using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public sealed class FileGalleryRepository : IGalleryRepository
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true
    };

    private readonly string _filePath;
    private readonly object _syncRoot = new();
    private readonly List<GalleryImage> _images;

    public FileGalleryRepository(string filePath)
    {
        _filePath = Path.GetFullPath(filePath);
        _images = LoadImages();
    }

    public IReadOnlyList<GalleryImage> GetAll()
    {
        lock (_syncRoot)
        {
            return _images
                .OrderByDescending(image => image.CreatedAtUtc)
                .Select(CloneImage)
                .ToList();
        }
    }

    public GalleryImage? GetById(Guid id)
    {
        lock (_syncRoot)
        {
            var image = _images.FirstOrDefault(existingImage => existingImage.Id == id);
            return image is null ? null : CloneImage(image);
        }
    }

    public GalleryImage Add(GalleryImage image)
    {
        lock (_syncRoot)
        {
            var storedImage = CloneImage(image);
            _images.Add(storedImage);
            SaveImages();
            return CloneImage(storedImage);
        }
    }

    public bool Delete(Guid id)
    {
        lock (_syncRoot)
        {
            var index = _images.FindIndex(existingImage => existingImage.Id == id);
            if (index < 0)
            {
                return false;
            }

            _images.RemoveAt(index);
            SaveImages();
            return true;
        }
    }

    private List<GalleryImage> LoadImages()
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);

        if (!File.Exists(_filePath))
        {
            var seededImages = GallerySeedData.CreateImages();
            SaveImages(seededImages);
            return seededImages;
        }

        using var stream = File.OpenRead(_filePath);
        var images = JsonSerializer.Deserialize<List<GalleryImage>>(stream, SerializerOptions);

        if (images is null || images.Count == 0)
        {
            var seededImages = GallerySeedData.CreateImages();
            SaveImages(seededImages);
            return seededImages;
        }

        return images.Select(CloneImage).ToList();
    }

    private void SaveImages() => SaveImages(_images);

    private void SaveImages(IReadOnlyList<GalleryImage> images)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
        var serializedImages = images.Select(CloneImage).ToList();
        var json = JsonSerializer.Serialize(serializedImages, SerializerOptions);
        File.WriteAllText(_filePath, json);
    }

    private static GalleryImage CloneImage(GalleryImage image) => image with { };
}
