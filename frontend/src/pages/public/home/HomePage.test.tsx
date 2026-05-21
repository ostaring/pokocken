import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "@/pages/public/home/HomePage";
import { renderWithMemoryRouter } from "@/test/utils/render";

const mockUseRecipesQuery = vi.fn();
const mockUseGalleryImagesQuery = vi.fn();

vi.mock("@/features/recipes/hooks/recipe-hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/recipes/hooks/recipe-hooks")>(
    "@/features/recipes/hooks/recipe-hooks",
  );

  return {
    ...actual,
    useRecipesQuery: (filters: { search?: string; category?: string }) =>
      mockUseRecipesQuery(filters),
  };
});

vi.mock("@/features/gallery/hooks/gallery-hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/gallery/hooks/gallery-hooks")>(
    "@/features/gallery/hooks/gallery-hooks",
  );

  return {
    ...actual,
    useGalleryImagesQuery: () => mockUseGalleryImagesQuery(),
  };
});

const recipeQuerySuccess = {
  data: [
    {
      id: "1",
      title: "Rostad tomatpasta",
      slug: "rostad-tomatpasta",
      description: "En snabb pasta med sota tomater.",
      category: "Dinner",
      prepTimeMinutes: 35,
      servings: 3,
      imageUrl: "https://example.com/pasta.jpg",
      isPublished: true,
    },
    {
      id: "2",
      title: "Mork chokladmousse",
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
};

const galleryQuerySuccess = {
  data: [
    {
      id: "gallery-1",
      imageUrl: "https://example.com/gallery-1.jpg",
      altText: "Pasta pa ett serveringsfat.",
      createdAtUtc: "2026-05-01T08:30:00Z",
    },
  ],
  isLoading: false,
  isError: false,
};

describe("HomePage", () => {
  it("shows loading state while featured recipes are fetched", () => {
    mockUseRecipesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    mockUseGalleryImagesQuery.mockReturnValue(galleryQuerySuccess);

    renderWithMemoryRouter(<HomePage />, ["/"]);

    expect(screen.getByText("Laddar recept...")).toBeInTheDocument();
  });

  it("renders the app-style home layout with recipes and gallery images", () => {
    mockUseRecipesQuery.mockReturnValue(recipeQuerySuccess);
    mockUseGalleryImagesQuery.mockReturnValue(galleryQuerySuccess);

    renderWithMemoryRouter(<HomePage />, ["/"]);

    expect(screen.getByRole("heading", { name: "Enbart för guldkäftar" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Middag" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rostad tomatpasta" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mork chokladmousse" })).toBeInTheDocument();
    expect(screen.getByAltText("Pasta pa ett serveringsfat.")).toBeInTheDocument();
    expect(screen.queryByText("Utvalt recept")).not.toBeInTheDocument();
    expect(screen.queryByText("Sa anvander du sidan")).not.toBeInTheDocument();
  });

  it("filters recipes directly from the home search panel", async () => {
    const user = userEvent.setup();
    mockUseRecipesQuery.mockImplementation((filters: { search?: string; category?: string }) => ({
      data:
        filters.search || filters.category
          ? [recipeQuerySuccess.data[0]]
          : recipeQuerySuccess.data,
      isLoading: false,
      isError: false,
    }));
    mockUseGalleryImagesQuery.mockReturnValue(galleryQuerySuccess);

    renderWithMemoryRouter(<HomePage />, ["/"]);

    await user.type(screen.getByLabelText(/sök recept/i), "pasta");
    await user.click(screen.getByRole("button", { name: /^filter$/i }));
    await user.click(screen.getByRole("button", { name: "Middag" }));
    await user.click(screen.getByRole("button", { name: /visa recept/i }));

    expect(await screen.findByText("Resultat")).toBeInTheDocument();
    expect(screen.getByText(/Visar/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rensa/i })).toBeInTheDocument();
    expect(mockUseRecipesQuery).toHaveBeenLastCalledWith({
      search: "pasta",
      category: "Dinner",
    });
  });

  it("shows an error state when featured recipes cannot be loaded", () => {
    mockUseRecipesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    mockUseGalleryImagesQuery.mockReturnValue(galleryQuerySuccess);

    renderWithMemoryRouter(<HomePage />, ["/"]);

    expect(screen.getByText("Kunde inte läsa in startsidans recept just nu.")).toBeInTheDocument();
  });
});
