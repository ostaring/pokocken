import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppRoutes } from "./AppRoutes";
import { renderWithMemoryRouter } from "../test/render";

vi.mock("../features/auth/auth-hooks", async () => {
  const actual = await vi.importActual<typeof import("../features/auth/auth-hooks")>(
    "../features/auth/auth-hooks",
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
  it("renders the public recipe list route", () => {
    renderWithMemoryRouter(<AppRoutes />, ["/recipes"]);

    expect(screen.getByRole("heading", { name: "Recept" })).toBeInTheDocument();
  });

  it("renders the not found page for unknown routes", () => {
    renderWithMemoryRouter(<AppRoutes />, ["/den-har-sidan-finns-inte"]);

    expect(screen.getByText("Vi hittade inte sidan du letade efter.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /visa recept/i })).toHaveAttribute("href", "/recipes");
  });
});
