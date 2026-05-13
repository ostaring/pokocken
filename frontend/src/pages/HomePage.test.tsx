import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";
import { renderWithMemoryRouter } from "../test/render";

const mockUseRecipesQuery = vi.fn();

vi.mock("../features/recipes/recipe-hooks", async () => {
  const actual = await vi.importActual<typeof import("../features/recipes/recipe-hooks")>(
    "../features/recipes/recipe-hooks",
  );

  return {
    ...actual,
    useRecipesQuery: () => mockUseRecipesQuery(),
  };
});

describe("HomePage", () => {
  it("shows loading state while featured recipes are fetched", () => {
    mockUseRecipesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithMemoryRouter(<HomePage />, ["/"]);

    expect(screen.getByText("Laddar utvalda recept...")).toBeInTheDocument();
  });

  it("renders featured recipes and public entry actions", () => {
    mockUseRecipesQuery.mockReturnValue({
      data: [
        {
          id: "1",
          title: "Rostad tomatpasta",
          slug: "rostad-tomatpasta",
          description: "En snabb pasta med söta tomater.",
          category: "Dinner",
          prepTimeMinutes: 35,
          servings: 3,
          imageUrl: "https://example.com/pasta.jpg",
          isPublished: true,
        },
        {
          id: "2",
          title: "Mörk chokladmousse",
          slug: "mork-chokladmousse",
          description: "Luftig chokladdessert.",
          category: "Dessert",
          prepTimeMinutes: 20,
          servings: 6,
          imageUrl: "https://example.com/mousse.jpg",
          isPublished: true,
        },
      ],
      isLoading: false,
      isError: false,
    });

    renderWithMemoryRouter(<HomePage />, ["/"]);

    expect(
      screen.getByRole("heading", {
        name: "Matlagning som känns lugn, tydlig och enkel att komma tillbaka till.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rostad tomatpasta" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mörk chokladmousse" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /utforska recept/i })).toHaveAttribute(
      "href",
      "/recipes",
    );
    expect(screen.getByRole("link", { name: /öppna admin/i })).toHaveAttribute("href", "/admin");
  });

  it("shows an error state when featured recipes cannot be loaded", () => {
    mockUseRecipesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithMemoryRouter(<HomePage />, ["/"]);

    expect(screen.getByText("Kunde inte läsa in startsidans recept just nu.")).toBeInTheDocument();
  });
});
