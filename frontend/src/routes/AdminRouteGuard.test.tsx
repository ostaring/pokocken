import { screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminRouteGuard } from "./AdminRouteGuard";
import { renderWithMemoryRouter } from "../test/render";

let sessionState: { data: { username: string } | null; isLoading: boolean } = {
  data: null,
  isLoading: false,
};

vi.mock("../features/auth/auth-hooks", async () => {
  const actual = await vi.importActual<typeof import("../features/auth/auth-hooks")>(
    "../features/auth/auth-hooks",
  );

  return {
    ...actual,
    useAdminSessionQuery: () => sessionState,
  };
});

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

describe("AdminRouteGuard", () => {
  beforeEach(() => {
    sessionState = {
      data: null,
      isLoading: false,
    };
  });

  it("shows a loading state while session is loading", () => {
    sessionState = {
      data: null,
      isLoading: true,
    };

    renderWithMemoryRouter(
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <div>Secret admin content</div>
            </AdminRouteGuard>
          }
        />
      </Routes>,
      ["/admin"],
    );

    expect(screen.getByText("Laddar adminsessionsdata...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login with redirect query", () => {
    renderWithMemoryRouter(
      <>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <div>Secret admin content</div>
              </AdminRouteGuard>
            }
          />
          <Route path="/admin/login" element={<div>Login page</div>} />
        </Routes>
        <LocationDisplay />
      </>,
      ["/admin"],
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/admin/login?redirect=%2Fadmin");
  });

  it("renders children for authenticated users", () => {
    sessionState = {
      data: { username: "admin" },
      isLoading: false,
    };

    renderWithMemoryRouter(
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <div>Secret admin content</div>
            </AdminRouteGuard>
          }
        />
      </Routes>,
      ["/admin"],
    );

    expect(screen.getByText("Secret admin content")).toBeInTheDocument();
  });
});
