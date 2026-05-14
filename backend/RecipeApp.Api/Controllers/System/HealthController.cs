using Microsoft.AspNetCore.Mvc;
using RecipeApp.Api.Data;

namespace RecipeApp.Api.Controllers;

[ApiController]
public sealed class HealthController : ControllerBase
{
    private readonly RecipeDbContext _dbContext;

    public HealthController(RecipeDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("/health")]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "ok",
            database = "PostgreSQL",
            canConnect = _dbContext.Database.CanConnect()
        });
    }
}
