import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecipeDetailsPage } from "@/pages/public/recipes/RecipeDetailsPage";
import { renderWithMemoryRouter } from "@/test/utils/render";

type MockRecipeQueryState = {
  data: unknown;
  isLoading: boolean;
  isError: boolean;
};

const recipeBySlugQueryState: MockRecipeQueryState = {
  data: undefined,
  isLoading: false,
  isError: false,
};

const relatedRecipesQueryState: MockRecipeQueryState = {
  data: [],
  isLoading: false,
  isError: false,
};

vi.mock("@/features/recipes/hooks/recipe-hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/recipes/hooks/recipe-hooks")>(
    "@/features/recipes/hooks/recipe-hooks",
  );

  return {
    ...actual,
    useRecipeBySlugQuery: () => recipeBySlugQueryState,
    useRecipesQuery: () => relatedRecipesQueryState,
  };
});

describe("RecipeDetailsPage", () => {
  it("shows a loading state while the recipe is being fetched", () => {
    recipeBySlugQueryState.data = undefined;
    recipeBySlugQueryState.isLoading = true;
    recipeBySlugQueryState.isError = false;
    relatedRecipesQueryState.data = [];

    renderWithMemoryRouter(<RecipeDetailsPage />, ["/recipes/brown-butter-pancakes"]);

    expect(screen.getByText("Laddar receptdetaljer...")).toBeInTheDocument();
  });

  it("shows a not found state without duplicate back navigation", () => {
    recipeBySlugQueryState.data = undefined;
    recipeBySlugQueryState.isLoading = false;
    recipeBySlugQueryState.isError = false;
    relatedRecipesQueryState.data = [];

    renderWithMemoryRouter(<RecipeDetailsPage />, ["/recipes/missing-recipe"]);

    expect(screen.getByText("Receptet hittades inte")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: /tillbaka till recepten/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders recipe details together with related recipes from the same category", () => {
    recipeBySlugQueryState.data = {
      id: "1",
      title: "Brown butter pancakes",
      slug: "brown-butter-pancakes",
      description: "Soft, golden pancakes with brown butter.",
      category: "Breakfast",
      prepTimeMinutes: 25,
      servings: 4,
      imageUrl: "https://example.com/pancakes.jpg",
      ingredients: ["Mjöl", "Mjölk", "Smör"],
      steps: ["Vispa ihop", "Stek", "Servera"],
      isPublished: true,
    };
    recipeBySlugQueryState.isLoading = false;
    recipeBySlugQueryState.isError = false;
    relatedRecipesQueryState.data = [
      {
        id: "1",
        title: "Brown butter pancakes",
        slug: "brown-butter-pancakes",
        description: "Soft, golden pancakes with brown butter.",
        category: "Breakfast",
        prepTimeMinutes: 25,
        servings: 4,
        imageUrl: "https://example.com/pancakes.jpg",
        isPublished: true,
      },
      {
        id: "2",
        title: "Overnight oats",
        slug: "overnight-oats",
        description: "A chilled breakfast jar.",
        category: "Breakfast",
        prepTimeMinutes: 10,
        servings: 2,
        imageUrl: "https://example.com/oats.jpg",
        isPublished: true,
      },
    ];

    renderWithMemoryRouter(<RecipeDetailsPage />, ["/recipes/brown-butter-pancakes"]);

    expect(screen.getByRole("heading", { name: "Brown butter pancakes" })).toBeInTheDocument();
    expect(screen.getByText("3 poster")).toBeInTheDocument();
    expect(screen.getByText("3 steg")).toBeInTheDocument();
    expect(screen.getByText("Liknande recept")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /overnight oats/i })).toHaveAttribute(
      "href",
      "/recipes/overnight-oats",
    );
    expect(screen.queryByRole("link", { name: /brown butter pancakes/i })).not.toBeInTheDocument();
  });
});
