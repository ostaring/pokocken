import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminDashboardPage } from "./AdminDashboardPage";
import { renderWithMemoryRouter, renderWithProviders } from "../test/render";
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
    useAdminRecipesQueryWithFilters: () => ({
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

    const unpublishButtons = screen.getAllByRole("button", { name: "Avpublicera" });
    await user.click(unpublishButtons[0]!);

    await waitFor(() => {
      expect(mockToggleMutateAsync).toHaveBeenCalledWith("1");
    });

    expect(await screen.findByText("Receptet flyttades tillbaka till utkast.")).toBeInTheDocument();
  });

  it("deletes a recipe after confirmation and shows success feedback", async () => {
    const user = userEvent.setup();
    mockDeleteMutateAsync.mockResolvedValueOnce(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithProviders(<AdminDashboardPage />);

    const deleteButtons = screen.getAllByRole("button", { name: "Ta bort" });
    await user.click(deleteButtons[0]!);

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("1");
    });

    expect(await screen.findByText("Receptet togs bort.")).toBeInTheDocument();
  });

  it("does not delete when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderWithProviders(<AdminDashboardPage />);

    const deleteButtons = screen.getAllByRole("button", { name: "Ta bort" });
    await user.click(deleteButtons[0]!);

    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });

  it("filters the visible list by selected status", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminDashboardPage />);

    expect(screen.getByText("Brown butter pancakes")).toBeInTheDocument();
    expect(screen.getByText("Dark chocolate mousse")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/status/i), "Utkast");

    expect(screen.queryByText("Brown butter pancakes")).not.toBeInTheDocument();
    expect(screen.queryByText("Roasted tomato pasta")).not.toBeInTheDocument();
    expect(screen.queryByText("Dark chocolate mousse")).not.toBeInTheDocument();
  });

  it("shows feedback passed back from another admin route", () => {
    renderWithMemoryRouter(<AdminDashboardPage />, [
      { pathname: "/admin", state: { feedbackMessage: "Receptet uppdaterades." } } as never,
    ]);

    expect(screen.getByText("Receptet uppdaterades.")).toBeInTheDocument();
  });
});
