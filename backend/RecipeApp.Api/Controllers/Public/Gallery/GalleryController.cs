using Microsoft.AspNetCore.Mvc;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Services;

namespace RecipeApp.Api.Controllers;

[ApiController]
[Route("api/gallery")]
public sealed class GalleryController : ControllerBase
{
    private readonly GalleryService _galleryService;

    public GalleryController(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    [HttpGet]
    public ActionResult<IReadOnlyList<GalleryImageResponse>> GetAllImages()
    {
        var images = _galleryService.GetAllImages();
        return Ok(images);
    }
}
