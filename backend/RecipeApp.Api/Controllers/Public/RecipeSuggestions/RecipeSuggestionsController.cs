using Microsoft.AspNetCore.Mvc;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Services;

namespace RecipeApp.Api.Controllers;

[ApiController]
[Route("api/recipe-suggestions")]
public sealed class RecipeSuggestionsController : ControllerBase
{
    private readonly IRecipeSuggestionService _recipeSuggestionService;

    public RecipeSuggestionsController(IRecipeSuggestionService recipeSuggestionService)
    {
        _recipeSuggestionService = recipeSuggestionService;
    }

    [HttpPost]
    public ActionResult<RecipeSuggestionResponse> CreateSuggestions(RecipeSuggestionRequest request)
    {
        var response = _recipeSuggestionService.CreateSuggestions(request);
        return Ok(response);
    }
}
