using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Infrastructure;
using RecipeApp.Api.Services;

namespace RecipeApp.Api.Controllers;

[ApiController]
[Route("api/admin/gallery")]
[AdminAuthorize]
[EnableRateLimiting(SecurityPolicyNames.AdminApiRateLimit)]
public sealed class AdminGalleryController : ControllerBase
{
    private readonly IGalleryService _galleryService;

    public AdminGalleryController(IGalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    [HttpGet]
    public ActionResult<IReadOnlyList<GalleryImageResponse>> GetAllImages()
    {
        var images = _galleryService.GetAllImages();
        return Ok(images);
    }

    [HttpPost]
    public ActionResult<GalleryImageResponse> CreateImage([FromBody] CreateGalleryImageRequest request)
    {
        try
        {
            var createdImage = _galleryService.CreateImage(request);
            return Created($"/api/admin/gallery/{createdImage.Id}", createdImage);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public IActionResult DeleteImage(Guid id)
    {
        var deleted = _galleryService.DeleteImage(id);
        return deleted ? NoContent() : NotFound();
    }
}
