import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppRoutes } from "@/routes/app/AppRoutes";
import { renderWithMemoryRouter } from "@/test/utils/render";

vi.mock("@/features/auth/hooks/auth-hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/auth/hooks/auth-hooks")>(
    "@/features/auth/hooks/auth-hooks",
  );

  return {
    ...actual,
    useAdminSessionQuery: () => ({
      data: null,
      isLoading: false,
    }),
    useLogoutMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  };
});

describe("AppRoutes", () => {
  it("renders the shared public header on public routes", () => {
    renderWithMemoryRouter(<AppRoutes />, ["/gallery"]);

    expect(screen.getByRole("link", { name: "Pokocken" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("searchbox", { name: "Sök recept" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Bläddra recept" })).not.toBeInTheDocument();
  });

  it("renders the public recipe list route", () => {
    renderWithMemoryRouter(<AppRoutes />, ["/recipes"]);

    expect(screen.getByRole("heading", { name: "Recept att hitta tillbaka till" })).toBeInTheDocument();
  });

  it("renders the gallery route", () => {
    renderWithMemoryRouter(<AppRoutes />, ["/gallery"]);

    expect(screen.getByRole("heading", { name: "Galleriet" })).toBeInTheDocument();
  });

  it("renders the recipe suggestion route", () => {
    renderWithMemoryRouter(<AppRoutes />, ["/suggest"]);

    expect(screen.getByRole("heading", { name: "Vad kan jag laga?" })).toBeInTheDocument();
  });

  it("renders the not found page for unknown routes", () => {
    renderWithMemoryRouter(<AppRoutes />, ["/den-har-sidan-finns-inte"]);

    expect(screen.getByText("Vi hittade inte sidan du letade efter.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /visa recept/i })).not.toBeInTheDocument();
  });
});
