import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminDashboardPage } from "./AdminDashboardPage";
import { renderWithProviders } from "../test/render";
import { mockRecipes } from "../features/recipes/mock-recipes";

const mockToggleMutateAsync = vi.fn();
const mockDeleteMutateAsync = vi.fn();

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
    useRecipesQuery: () => ({
      data: mockRecipes,
      isLoading: false,
      isError: false,
    }),
    useToggleRecipePublishedMutation: () => ({
      mutateAsync: mockToggleMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    }),
    useDeleteRecipeMutation: () => ({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    }),
  };
});

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    mockToggleMutateAsync.mockReset();
    mockDeleteMutateAsync.mockReset();
    vi.restoreAllMocks();
  });

  it("toggles recipe publish state and shows success feedback", async () => {
    const user = userEvent.setup();
    mockToggleMutateAsync.mockResolvedValueOnce(undefined);

    renderWithProviders(<AdminDashboardPage />);

    const unpublishButtons = screen.getAllByRole("button", { name: "Unpublish" });
    await user.click(unpublishButtons[0]!);

    await waitFor(() => {
      expect(mockToggleMutateAsync).toHaveBeenCalledWith("1");
    });

    expect(await screen.findByText("Recipe moved back to draft.")).toBeInTheDocument();
  });

  it("deletes a recipe after confirmation and shows success feedback", async () => {
    const user = userEvent.setup();
    mockDeleteMutateAsync.mockResolvedValueOnce(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithProviders(<AdminDashboardPage />);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]!);

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("1");
    });

    expect(await screen.findByText("Recipe deleted successfully.")).toBeInTheDocument();
  });

  it("does not delete when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderWithProviders(<AdminDashboardPage />);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]!);

    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });
});
