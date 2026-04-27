import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminRecipeEditorPage } from "./AdminRecipeEditorPage";
import { AdminSessionExpiredError, RecipeValidationError } from "../lib/api/http/recipes-adapter";
import { renderWithProviders } from "../test/render";

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
const mockNavigate = vi.fn();
let recipeByIdQueryState: {
  data: unknown;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
} = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
    useLocation: () => ({ pathname: "/admin/recipes/new", search: "" }),
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
      error: null,
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

    await user.type(screen.getByLabelText(/ingrediens 1/i), "200 g pasta");
    await user.click(screen.getByRole("button", { name: /lagg till ingrediens/i }));
    await user.type(screen.getByLabelText(/ingrediens 2/i), "1 lemon");
    await user.click(screen.getByRole("button", { name: /lagg till ingrediens/i }));
    await user.type(screen.getByLabelText(/ingrediens 3/i), "Fresh herbs");

    await user.type(screen.getByLabelText(/steg 1/i), "Cook the pasta");
    await user.click(screen.getByRole("button", { name: /lagg till steg/i }));
    await user.type(screen.getByLabelText(/steg 2/i), "Mix the dressing");
    await user.click(screen.getByRole("button", { name: /lagg till steg/i }));
    await user.type(screen.getByLabelText(/steg 3/i), "Combine and serve");

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

  it("lets the admin add and remove structured ingredient and step rows", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminRecipeEditorPage mode="create" />);

    expect(screen.getByLabelText(/ingrediens 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/steg 1/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /lagg till ingrediens/i }));
    await user.click(screen.getByRole("button", { name: /lagg till steg/i }));

    expect(screen.getByLabelText(/ingrediens 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/steg 2/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /ta bort/i })[0]);
    await user.click(screen.getAllByRole("button", { name: /ta bort/i })[1]);

    expect(screen.queryByLabelText(/ingrediens 2/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/steg 2/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/ingrediens 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/steg 1/i)).toBeInTheDocument();
  });

  it("shows backend validation errors on the matching form fields", async () => {
    const user = userEvent.setup();
    mockCreateMutateAsync.mockRejectedValueOnce(
      new RecipeValidationError({
        slug: ["Titeln genererar en ogiltig slug. Anvand bokstaver, siffror och bindestreck."],
      }),
    );

    renderWithProviders(<AdminRecipeEditorPage mode="create" />);

    await user.type(screen.getByLabelText(/titel/i), "Crème brûlée");
    await user.type(
      screen.getByLabelText(/beskrivning/i),
      "En len dessert med karamelliserat socker.",
    );
    await user.clear(screen.getByLabelText(/bild-url/i));
    await user.type(screen.getByLabelText(/bild-url/i), "https://example.com/creme-brulee.jpg");
    await user.type(screen.getByLabelText(/ingrediens 1/i), "Gradde");
    await user.type(screen.getByLabelText(/steg 1/i), "Baka forsiktigt.");

    await user.click(screen.getByRole("button", { name: /skapa recept/i }));

    expect(await screen.findByText(/titeln genererar en ogiltig slug/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("redirects to login when the admin session expires during save", async () => {
    const user = userEvent.setup();
    mockCreateMutateAsync.mockRejectedValueOnce(new AdminSessionExpiredError());

    renderWithProviders(<AdminRecipeEditorPage mode="create" />);

    await user.type(screen.getByLabelText(/titel/i), "Citronpaj");
    await user.type(screen.getByLabelText(/beskrivning/i), "En frisk och len citronpaj for helgen.");
    await user.clear(screen.getByLabelText(/bild-url/i));
    await user.type(screen.getByLabelText(/bild-url/i), "https://example.com/citronpaj.jpg");
    await user.type(screen.getByLabelText(/ingrediens 1/i), "Citroner");
    await user.type(screen.getByLabelText(/steg 1/i), "Blanda fyllningen.");

    await user.click(screen.getByRole("button", { name: /skapa recept/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/login?redirect=%2Fadmin%2Frecipes%2Fnew", {
        replace: true,
        state: { feedbackMessage: "Logga in igen for att fortsatta administrera recepten." },
      });
    });
  });

  it("updates the metadata preview while the admin edits the form", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminRecipeEditorPage mode="create" />);

    expect(screen.getByText("skapas-fran-titeln")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/titel/i), "Fresh Pasta Salad");
    await user.selectOptions(screen.getByLabelText(/kategori/i), "Lunch");
    await user.clear(screen.getByLabelText(/tillagningstid/i));
    await user.type(screen.getByLabelText(/tillagningstid/i), "22");
    await user.clear(screen.getByLabelText(/portioner/i));
    await user.type(screen.getByLabelText(/portioner/i), "5");
    await user.click(screen.getByLabelText(/publicerad/i));

    expect(screen.getByText("fresh-pasta-salad")).toBeInTheDocument();
    expect(screen.getAllByText("Lunch")).toHaveLength(2);
    expect(screen.getByText("22 min")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getAllByText("Publicerad").length).toBeGreaterThan(1);
  });

  it("shows the loading state for edit mode while recipe data is being fetched", async () => {
    recipeByIdQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
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
        ingredients: ["Mjol", "Mjolk"],
        steps: ["Vispa ihop", "Stek"],
        isPublished: true,
      },
      isLoading: false,
      isError: false,
      error: null,
    };

    renderWithProviders(<AdminRecipeEditorPage mode="edit" />);

    await user.clear(screen.getByLabelText(/titel/i));
    await user.type(screen.getByLabelText(/titel/i), "Brown butter pancakes deluxe");
    await user.click(screen.getByRole("button", { name: /spara andringar/i }));

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: "1",
        input: expect.objectContaining({
          title: "Brown butter pancakes deluxe",
          ingredients: ["Mjol", "Mjolk"],
          steps: ["Vispa ihop", "Stek"],
        }),
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin", {
      replace: true,
      state: { feedbackMessage: "Receptet uppdaterades." },
    });
  });
});
