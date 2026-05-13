namespace RecipeApp.Api.Data;

public sealed class RecipeEntity
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public int PrepTimeMinutes { get; set; }
    public int Servings { get; set; }
    public required string ImageUrl { get; set; }
    public bool IsPublished { get; set; }
    public required string IngredientsJson { get; set; }
    public required string StepsJson { get; set; }
}
