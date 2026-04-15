import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminRecipeEditorPage } from "./AdminRecipeEditorPage";
import { renderWithProviders } from "../test/render";

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
let recipeByIdQueryState: {
  data: unknown;
  isLoading: boolean;
  isError: boolean;
} = {
  data: undefined,
  isLoading: false,
  isError: false,
};

vi.mock("../features/auth/auth-hooks", async () => {
  const actual = await vi.importActual<typeof import("../features/auth/auth-hooks")>(
    "../features/auth/auth-hooks",
  );

  return {
    ...actual,
    useAdminSessionQuery: () => ({
      data: { username: "admin" },
      isLoading: false,
    }),
    useLogoutMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  };
});

vi.mock("../features/recipes/recipe-hooks", async () => {
  const actual = await vi.importActual<typeof import("../features/recipes/recipe-hooks")>(
    "../features/recipes/recipe-hooks",
  );

  return {
    ...actual,
    useRecipeByIdQuery: () => recipeByIdQueryState,
    useCreateRecipeMutation: () => ({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
      error: null,
    }),
    useUpdateRecipeMutation: () => ({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
      error: null,
    }),
  };
});

describe("AdminRecipeEditorPage", () => {
  beforeEach(() => {
    mockCreateMutateAsync.mockReset();
    mockUpdateMutateAsync.mockReset();
    recipeByIdQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
    };
  });

  it("submits create mode values as a normalized recipe payload", async () => {
    const user = userEvent.setup();
    mockCreateMutateAsync.mockResolvedValueOnce(undefined);

    renderWithProviders(<AdminRecipeEditorPage mode="create" />);

    await user.type(screen.getByLabelText(/titel/i), "Fresh Pasta Salad");
    await user.type(
      screen.getByLabelText(/beskrivning/i),
      "A bright and herby pasta salad for warm evenings.",
    );
    await user.selectOptions(screen.getByLabelText(/kategori/i), "Lunch");
    await user.clear(screen.getByLabelText(/bild-url/i));
    await user.type(
      screen.getByLabelText(/bild-url/i),
      "https://example.com/pasta-salad.jpg",
    );
    await user.clear(screen.getByLabelText(/tillagningstid/i));
    await user.type(screen.getByLabelText(/tillagningstid/i), "22");
    await user.clear(screen.getByLabelText(/portioner/i));
    await user.type(screen.getByLabelText(/portioner/i), "5");
    await user.type(
      screen.getByLabelText(/ingredienser/i),
      "200 g pasta{enter}1 lemon{enter}Fresh herbs",
    );
    await user.type(
      screen.getByLabelText(/^steg$/i),
      "Cook the pasta{enter}Mix the dressing{enter}Combine and serve",
    );
    await user.click(screen.getByLabelText(/publicerad/i));
    await user.click(screen.getByRole("button", { name: /skapa recept/i }));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        title: "Fresh Pasta Salad",
        description: "A bright and herby pasta salad for warm evenings.",
        category: "Lunch",
        prepTimeMinutes: 22,
        servings: 5,
        imageUrl: "https://example.com/pasta-salad.jpg",
        ingredients: ["200 g pasta", "1 lemon", "Fresh herbs"],
        steps: ["Cook the pasta", "Mix the dressing", "Combine and serve"],
        isPublished: true,
      });
    });

    expect(await screen.findByText("Receptet skapades.")).toBeInTheDocument();
  });

  it("shows the loading state for edit mode while recipe data is being fetched", async () => {
    recipeByIdQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
    };

    renderWithProviders(<AdminRecipeEditorPage mode="edit" />);

    expect(screen.getByText("Laddar recepteditorn...")).toBeInTheDocument();
  });
});
