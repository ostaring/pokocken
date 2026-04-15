namespace RecipeApp.Api.Domain;

public sealed record Recipe
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public required string Slug { get; init; }
    public required string Description { get; init; }
    public required string Category { get; init; }
    public required int PrepTimeMinutes { get; init; }
    public required int Servings { get; init; }
    public required string ImageUrl { get; init; }
    public required bool IsPublished { get; init; }
    public required IReadOnlyList<string> Ingredients { get; init; }
    public required IReadOnlyList<string> Steps { get; init; }
}
