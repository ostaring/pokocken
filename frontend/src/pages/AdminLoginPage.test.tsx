import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdminLoginPage } from "./AdminLoginPage";
import { renderWithProviders } from "../test/render";

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

vi.mock("../features/auth/auth-hooks", async () => {
  const actual = await vi.importActual<typeof import("../features/auth/auth-hooks")>(
    "../features/auth/auth-hooks",
  );

  return {
    ...actual,
    useLoginMutation: () => ({
      mutateAsync: mockMutateAsync,
      isError: false,
      error: null,
    }),
  };
});

describe("AdminLoginPage", () => {
  it("shows validation messages for invalid input", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminLoginPage />);

    await user.type(screen.getByLabelText(/username/i), "ab");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Username must be at least 3 characters."),
    ).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  it("submits valid credentials and redirects to admin", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({ username: "admin" });

    renderWithProviders(<AdminLoginPage />);

    await user.type(screen.getByLabelText(/username/i), "admin");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        username: "admin",
        password: "password123",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });
});
