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

    await user.type(screen.getByLabelText(/användarnamn/i), "ab");
    await user.type(screen.getByLabelText(/lösenord/i), "short");
    await user.click(screen.getByRole("button", { name: /logga in/i }));

    expect(
      await screen.findByText("Användarnamnet måste vara minst 3 tecken."),
    ).toBeInTheDocument();
    expect(screen.getByText("Lösenordet måste vara minst 8 tecken.")).toBeInTheDocument();
  });

  it("submits valid credentials and redirects to admin", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({ username: "admin" });

    renderWithProviders(<AdminLoginPage />);

    await user.type(screen.getByLabelText(/användarnamn/i), "admin");
    await user.type(screen.getByLabelText(/lösenord/i), "password123");
    await user.click(screen.getByRole("button", { name: /logga in/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        username: "admin",
        password: "password123",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });
});
