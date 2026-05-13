import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminDashboardPage } from "@/pages/admin/dashboard/AdminDashboardPage";
import { AdminSessionExpiredError } from "@/lib/api/recipes/http/recipes-adapter";
import { renderWithMemoryRouter, renderWithProviders } from "@/test/utils/render";
import { mockRecipes } from "@/features/recipes/fixtures/mock-recipes";

const mockToggleMutateAsync = vi.fn();
const mockDeleteMutateAsync = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/features/auth/hooks/auth-hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/auth/hooks/auth-hooks")>(
    "@/features/auth/hooks/auth-hooks",
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

vi.mock("@/features/recipes/hooks/recipe-hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/recipes/hooks/recipe-hooks")>(
    "@/features/recipes/hooks/recipe-hooks",
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
    mockNavigate.mockReset();
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

    renderWithMemoryRouter(<AdminDashboardPage />, ["/admin"]);

    expect(screen.getByText("Brynt smör-pannkakor")).toBeInTheDocument();
    expect(screen.getByText("Mörk chokladmousse")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/status/i), "Utkast");

    expect(screen.queryByText("Brynt smör-pannkakor")).not.toBeInTheDocument();
    expect(screen.queryByText("Rostad tomatpasta")).not.toBeInTheDocument();
    expect(screen.queryByText("Mörk chokladmousse")).not.toBeInTheDocument();
  });

  it("shows feedback passed back from another admin route", () => {
    renderWithMemoryRouter(<AdminDashboardPage />, [
      { pathname: "/admin", state: { feedbackMessage: "Receptet uppdaterades." } } as never,
    ]);

    expect(screen.getByText("Receptet uppdaterades.")).toBeInTheDocument();
  });

  it("redirects to login when the admin session expires during delete", async () => {
    const user = userEvent.setup();
    mockDeleteMutateAsync.mockRejectedValueOnce(new AdminSessionExpiredError());
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithMemoryRouter(<AdminDashboardPage />, ["/admin"]);

    const deleteButtons = screen.getAllByRole("button", { name: "Ta bort" });
    await user.click(deleteButtons[0]!);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/login?redirect=%2Fadmin", { replace: true });
    });
  });
});
