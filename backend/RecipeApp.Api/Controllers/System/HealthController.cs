using Microsoft.AspNetCore.Mvc;

namespace RecipeApp.Api.Controllers;

[ApiController]
public sealed class HealthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public HealthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("/health")]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "ok",
            persistenceMode = _configuration["Persistence:Mode"] ?? "Memory"
        });
    }
}
