import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminRecipeEditorPage } from "./AdminRecipeEditorPage";
import { renderWithProviders } from "../test/render";

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
const mockNavigate = vi.fn();
let recipeByIdQueryState: {
  data: unknown;
  isLoading: boolean;
  isError: boolean;
} = {
  data: undefined,
  isLoading: false,
  isError: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

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
    mockNavigate.mockReset();
    recipeByIdQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
    };
  });

  it("submits create mode values as a normalized recipe payload", async () => {
    const user = userEvent.setup();
    mockCreateMutateAsync.mockResolvedValueOnce({ id: "42" });

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

    expect(mockNavigate).toHaveBeenCalledWith("/admin/recipes/42/edit", {
      replace: true,
      state: { feedbackMessage: "Receptet skapades." },
    });
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

  it("navigates back to dashboard after saving changes in edit mode", async () => {
    const user = userEvent.setup();
    mockUpdateMutateAsync.mockResolvedValueOnce({ id: "1" });
    recipeByIdQueryState = {
      data: {
        id: "1",
        title: "Brown butter pancakes",
        slug: "brown-butter-pancakes",
        description: "Soft, golden pancakes with brown butter.",
        category: "Breakfast",
        prepTimeMinutes: 25,
        servings: 4,
        imageUrl: "https://example.com/pancakes.jpg",
        ingredients: ["Mjöl", "Mjölk"],
        steps: ["Vispa ihop", "Stek"],
        isPublished: true,
      },
      isLoading: false,
      isError: false,
    };

    renderWithProviders(<AdminRecipeEditorPage mode="edit" />);

    await user.clear(screen.getByLabelText(/titel/i));
    await user.type(screen.getByLabelText(/titel/i), "Brown butter pancakes deluxe");
    await user.click(screen.getByRole("button", { name: /spara ändringar/i }));

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalled();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin", {
      replace: true,
      state: { feedbackMessage: "Receptet uppdaterades." },
    });
  });
});
