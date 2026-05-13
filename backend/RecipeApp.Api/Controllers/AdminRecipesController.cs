using Microsoft.AspNetCore.Mvc;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Infrastructure;
using RecipeApp.Api.Services;

namespace RecipeApp.Api.Controllers;

[ApiController]
[Route("api/admin/recipes")]
[AdminAuthorize]
public sealed class AdminRecipesController : ControllerBase
{
    private readonly RecipeService _recipeService;

    public AdminRecipesController(RecipeService recipeService)
    {
        _recipeService = recipeService;
    }

    [HttpGet]
    public ActionResult<IReadOnlyList<RecipeResponse>> GetAllRecipes(
        [FromQuery] string? search,
        [FromQuery] string? category)
    {
        var recipes = _recipeService.GetAllRecipes(search, category);
        return Ok(recipes);
    }

    [HttpGet("{slug}")]
    public ActionResult<RecipeResponse> GetRecipeBySlug(string slug)
    {
        var recipe = _recipeService.GetRecipeBySlug(slug);
        return recipe is null ? NotFound() : Ok(recipe);
    }

    [HttpPost]
    public ActionResult<RecipeResponse> CreateRecipe([FromBody] CreateRecipeRequest request)
    {
        var validationErrors = RecipeRequestValidator.Validate(request);
        if (validationErrors.Count > 0)
        {
            return BadRequest(new ValidationProblemDetails(validationErrors));
        }

        try
        {
            var createdRecipe = _recipeService.CreateRecipe(request);
            return Created($"/api/admin/recipes/{createdRecipe.Slug}", createdRecipe);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("{slug}")]
    public ActionResult<RecipeResponse> UpdateRecipe(string slug, [FromBody] UpdateRecipeRequest request)
    {
        var validationErrors = RecipeRequestValidator.Validate(request);
        if (validationErrors.Count > 0)
        {
            return BadRequest(new ValidationProblemDetails(validationErrors));
        }

        try
        {
            var updatedRecipe = _recipeService.UpdateRecipe(slug, request);
            return updatedRecipe is null ? NotFound() : Ok(updatedRecipe);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("{slug}")]
    public IActionResult DeleteRecipe(string slug)
    {
        var deleted = _recipeService.DeleteRecipe(slug);
        return deleted ? NoContent() : NotFound();
    }
}
