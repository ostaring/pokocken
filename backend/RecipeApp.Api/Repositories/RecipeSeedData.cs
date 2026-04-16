using RecipeApp.Api.Domain;

namespace RecipeApp.Api.Repositories;

public static class RecipeSeedData
{
    private static readonly IReadOnlyList<Recipe> SeedRecipes =
    [
        new Recipe
        {
            Id = Guid.Parse("3A1A31C0-2D7B-4E16-A5E8-94A749D20411"),
            Title = "Brown butter pancakes",
            Slug = "brown-butter-pancakes",
            Description = "Soft, golden pancakes with brown butter, cardamom, and a sharp berry topping.",
            Category = "Breakfast",
            PrepTimeMinutes = 25,
            Servings = 4,
            ImageUrl = "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80",
            IsPublished = true,
            Ingredients =
            [
                "250 g plain flour",
                "2 tsp baking powder",
                "2 tbsp sugar",
                "350 ml milk",
                "2 eggs",
                "80 g browned butter",
                "A pinch of cardamom"
            ],
            Steps =
            [
                "Whisk the dry ingredients together in a large bowl.",
                "Combine milk, eggs, and brown butter, then fold into the dry mix until just combined.",
                "Rest the batter for 10 minutes.",
                "Cook in a buttered pan over medium heat until golden on both sides.",
                "Serve with berries and a spoon of creme fraiche."
            ]
        },
        new Recipe
        {
            Id = Guid.Parse("5C697D63-8C72-45F8-9CA8-5AE47AD5BF11"),
            Title = "Roasted tomato pasta",
            Slug = "roasted-tomato-pasta",
            Description = "A quick pasta built around sweet roasted tomatoes, garlic, basil, and olive oil.",
            Category = "Dinner",
            PrepTimeMinutes = 35,
            Servings = 3,
            ImageUrl = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
            IsPublished = true,
            Ingredients =
            [
                "300 g pasta",
                "400 g cherry tomatoes",
                "4 garlic cloves",
                "Olive oil",
                "Fresh basil",
                "Parmesan"
            ],
            Steps =
            [
                "Roast tomatoes and garlic with olive oil until collapsed and sweet.",
                "Cook pasta until al dente and reserve a little pasta water.",
                "Toss pasta with roasted tomatoes, garlic, basil, and pasta water.",
                "Finish with parmesan and black pepper."
            ]
        },
        new Recipe
        {
            Id = Guid.Parse("B1FD4A13-4D97-482A-A8F3-0E3E0B0502FE"),
            Title = "Dark chocolate mousse",
            Slug = "dark-chocolate-mousse",
            Description = "Deep chocolate flavor, light texture, and just enough sea salt on top.",
            Category = "Dessert",
            PrepTimeMinutes = 20,
            Servings = 6,
            ImageUrl = "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=80",
            IsPublished = true,
            Ingredients =
            [
                "200 g dark chocolate",
                "300 ml cream",
                "3 eggs",
                "2 tbsp sugar",
                "Sea salt"
            ],
            Steps =
            [
                "Melt the chocolate gently and let it cool slightly.",
                "Whip the cream to soft peaks.",
                "Whisk egg yolks with sugar, then combine with chocolate.",
                "Fold in whipped cream and chill before serving.",
                "Finish with a pinch of sea salt."
            ]
        },
        new Recipe
        {
            Id = Guid.Parse("3542E8A5-B0F5-43DD-85AF-A84DB646E271"),
            Title = "Draft lemon tart",
            Slug = "draft-lemon-tart",
            Description = "A draft recipe used to ensure unpublished items stay private.",
            Category = "Dessert",
            PrepTimeMinutes = 50,
            Servings = 8,
            ImageUrl = "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=80",
            IsPublished = false,
            Ingredients =
            [
                "Pastry shell",
                "Lemons",
                "Butter",
                "Sugar",
                "Eggs"
            ],
            Steps =
            [
                "Blind bake the shell.",
                "Prepare the lemon filling.",
                "Bake until just set."
            ]
        }
    ];

    public static List<Recipe> CreateRecipes() => SeedRecipes
        .Select(recipe => recipe with
        {
            Ingredients = [.. recipe.Ingredients],
            Steps = [.. recipe.Steps]
        })
        .ToList();
}
