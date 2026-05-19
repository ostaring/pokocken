import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocation } from "react-router-dom";
import { RecipesPage } from "@/pages/public/recipes/RecipesPage";
import { renderWithMemoryRouter } from "@/test/utils/render";

const mockUseRecipesQuery = vi.fn();

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

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

describe("RecipesPage", () => {
  beforeEach(() => {
    mockUseRecipesQuery.mockReset();
  });

  it("shows loading state while public recipes are fetched", () => {
    mockUseRecipesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithMemoryRouter(<RecipesPage />, ["/recipes"]);

    expect(screen.getByText("Laddar recept...")).toBeInTheDocument();
  });

  it("shows public recipe cards without duplicate start-page navigation", () => {
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
      ],
      isLoading: false,
      isError: false,
    });

    renderWithMemoryRouter(<RecipesPage />, ["/recipes"]);

    expect(screen.getByRole("heading", { name: "Rostad tomatpasta" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /tillbaka till startsidan/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /öppna recept/i })).toHaveAttribute(
      "href",
      "/recipes/rostad-tomatpasta",
    );
  });

  it("reads active filters from the URL and keeps them visible in the UI", () => {
    mockUseRecipesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    renderWithMemoryRouter(
      <>
        <RecipesPage />
        <LocationDisplay />
      </>,
      ["/recipes?search=tomat&category=Dinner"],
    );

    expect(screen.getByDisplayValue("tomat")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /kategori/i })).toHaveValue("Dinner");
    expect(screen.getByText("Sökning: tomat")).toBeInTheDocument();
    expect(screen.getByText("Kategori: Middag")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/recipes?search=tomat&category=Dinner");
    expect(mockUseRecipesQuery).toHaveBeenCalledWith({
      search: "tomat",
      category: "Dinner",
    });
  });

  it("shows active filters and allows the user to reset them", async () => {
    const user = userEvent.setup();
    mockUseRecipesQuery.mockImplementation((filters: { search?: string; category?: string }) => ({
      data:
        filters.search || filters.category
          ? []
          : [
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
            ],
      isLoading: false,
      isError: false,
    }));

    renderWithMemoryRouter(
      <>
        <RecipesPage />
        <LocationDisplay />
      </>,
      ["/recipes"],
    );

    expect(screen.getByRole("button", { name: /rensa filter/i })).toBeDisabled();

    await user.type(screen.getByLabelText(/sök recept/i), "tomat");
    await user.selectOptions(screen.getByLabelText(/kategori/i), "Dinner");

    expect(await screen.findByText("Sökning: tomat")).toBeInTheDocument();
    expect(screen.getByText("Kategori: Middag")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rensa filter/i })).toBeEnabled();
    expect(screen.getByTestId("location")).toHaveTextContent("/recipes?search=tomat&category=Dinner");

    await user.click(screen.getByRole("button", { name: /rensa filter/i }));

    expect(screen.queryByText("Sökning: tomat")).not.toBeInTheDocument();
    expect(screen.queryByText("Kategori: Middag")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rensa filter/i })).toBeDisabled();
    expect(screen.getByTestId("location")).toHaveTextContent("/recipes");
  });

  it("lets the user recover from an empty result by resetting the filters", async () => {
    const user = userEvent.setup();
    mockUseRecipesQuery.mockImplementation((filters: { search?: string; category?: string }) => ({
      data:
        filters.search === "zzz"
          ? []
          : [
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
            ],
      isLoading: false,
      isError: false,
    }));

    renderWithMemoryRouter(
      <>
        <RecipesPage />
        <LocationDisplay />
      </>,
      ["/recipes"],
    );

    await user.type(screen.getByLabelText(/sök recept/i), "zzz");

    expect(await screen.findByText("Inga recept matchade")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/recipes?search=zzz");

    await user.click(screen.getByRole("button", { name: /visa alla recept/i }));

    expect(screen.queryByText("Inga recept matchade")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rostad tomatpasta" })).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/recipes");
  });
});
