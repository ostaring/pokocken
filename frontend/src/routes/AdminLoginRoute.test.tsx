import { screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminLoginRoute } from "./AdminLoginRoute";
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

describe("AdminLoginRoute", () => {
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
          path="/admin/login"
          element={
            <AdminLoginRoute>
              <div>Login form</div>
            </AdminLoginRoute>
          }
        />
      </Routes>,
      ["/admin/login"],
    );

    expect(screen.getByText("Loading admin session...")).toBeInTheDocument();
  });

  it("renders login content when there is no active session", () => {
    renderWithMemoryRouter(
      <Routes>
        <Route
          path="/admin/login"
          element={
            <AdminLoginRoute>
              <div>Login form</div>
            </AdminLoginRoute>
          }
        />
      </Routes>,
      ["/admin/login"],
    );

    expect(screen.getByText("Login form")).toBeInTheDocument();
  });

  it("redirects authenticated users to the requested admin route", () => {
    sessionState = {
      data: { username: "admin" },
      isLoading: false,
    };

    renderWithMemoryRouter(
      <>
        <Routes>
          <Route
            path="/admin/login"
            element={
              <AdminLoginRoute>
                <div>Login form</div>
              </AdminLoginRoute>
            }
          />
          <Route path="/admin/recipes/new" element={<div>Create recipe page</div>} />
        </Routes>
        <LocationDisplay />
      </>,
      ["/admin/login?redirect=%2Fadmin%2Frecipes%2Fnew"],
    );

    expect(screen.getByText("Create recipe page")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/admin/recipes/new");
  });
});
