using Microsoft.AspNetCore.Mvc;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Services;

namespace RecipeApp.Api.Controllers;

[ApiController]
[Route("api/recipes")]
public sealed class RecipesController : ControllerBase
{
    private readonly IRecipeService _recipeService;

    public RecipesController(IRecipeService recipeService)
    {
        _recipeService = recipeService;
    }

    [HttpGet]
    public ActionResult<IReadOnlyList<RecipeResponse>> GetPublishedRecipes(
        [FromQuery] string? search,
        [FromQuery] string? category)
    {
        var recipes = _recipeService.GetPublishedRecipes(search, category);
        return Ok(recipes);
    }

    [HttpGet("{slug}")]
    public ActionResult<RecipeResponse> GetPublishedRecipeBySlug(string slug)
    {
        var recipe = _recipeService.GetPublishedRecipeBySlug(slug);
        return recipe is null ? NotFound() : Ok(recipe);
    }
}
