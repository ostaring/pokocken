import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminLoginPage } from "@/pages/admin/login/AdminLoginPage";
import { renderWithProviders } from "@/test/utils/render";

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();
let mockLocationState: unknown = null;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
    useLocation: () => ({ pathname: "/admin/login", search: "", state: mockLocationState }),
  };
});

vi.mock("@/features/auth/hooks/auth-hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/auth/hooks/auth-hooks")>(
    "@/features/auth/hooks/auth-hooks",
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
  beforeEach(() => {
    mockNavigate.mockReset();
    mockMutateAsync.mockReset();
    mockLocationState = null;
  });

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

  it("shows feedback when the user is redirected back after session expiry", () => {
    mockLocationState = {
      feedbackMessage: "Logga in igen för att fortsätta administrera recepten.",
    };

    renderWithProviders(<AdminLoginPage />);

    expect(
      screen.getByText("Logga in igen för att fortsätta administrera recepten."),
    ).toBeInTheDocument();
  });
});
