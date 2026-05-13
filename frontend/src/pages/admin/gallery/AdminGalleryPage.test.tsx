import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminGalleryPage } from "@/pages/admin/gallery/AdminGalleryPage";
import { AdminSessionExpiredError } from "@/lib/api/recipes/http/recipes-adapter";
import { renderWithProviders } from "@/test/utils/render";

const mockCreateMutateAsync = vi.fn();
const mockDeleteMutateAsync = vi.fn();
const mockNavigate = vi.fn();
let galleryQueryState: {
  data: unknown;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
} = {
  data: [],
  isLoading: false,
  isError: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/admin/gallery", search: "" }),
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

vi.mock("@/features/gallery/hooks/gallery-hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/gallery/hooks/gallery-hooks")>(
    "@/features/gallery/hooks/gallery-hooks",
  );

  return {
    ...actual,
    useAdminGalleryImagesQuery: () => galleryQueryState,
    useCreateGalleryImageMutation: () => ({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    }),
    useDeleteGalleryImageMutation: () => ({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    }),
  };
});

describe("AdminGalleryPage", () => {
  beforeEach(() => {
    mockCreateMutateAsync.mockReset();
    mockDeleteMutateAsync.mockReset();
    mockNavigate.mockReset();
    galleryQueryState = {
      data: [
        {
          id: "gallery-1",
          imageUrl: "https://example.com/pasta.jpg",
          altText: "Tallrik med nygjord pasta.",
          createdAtUtc: "2026-05-13T10:00:00Z",
        },
      ],
      isLoading: false,
      isError: false,
    };
  });

  it("submits a new gallery image from the admin form", async () => {
    const user = userEvent.setup();
    mockCreateMutateAsync.mockResolvedValueOnce(undefined);

    renderWithProviders(<AdminGalleryPage />);

    await user.type(screen.getByLabelText(/bild-url/i), "https://example.com/new-dish.jpg");
    await user.type(screen.getByLabelText(/beskrivning/i), "Ny rätt på serveringsfat.");
    await user.click(screen.getByRole("button", { name: /lägg till bild/i }));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        imageUrl: "https://example.com/new-dish.jpg",
        altText: "Ny rätt på serveringsfat.",
      });
    });

    expect(await screen.findByText("Bilden lades till i galleriet.")).toBeInTheDocument();
  });

  it("redirects to login when the admin session expires during create", async () => {
    const user = userEvent.setup();
    mockCreateMutateAsync.mockRejectedValueOnce(new AdminSessionExpiredError());

    renderWithProviders(<AdminGalleryPage />);

    await user.type(screen.getByLabelText(/bild-url/i), "https://example.com/new-dish.jpg");
    await user.type(screen.getByLabelText(/beskrivning/i), "Ny rätt på serveringsfat.");
    await user.click(screen.getByRole("button", { name: /lägg till bild/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/login?redirect=%2Fadmin%2Fgallery", {
        replace: true,
        state: { feedbackMessage: "Logga in igen för att fortsätta administrera galleriet." },
      });
    });
  });

  it("deletes an existing gallery image", async () => {
    const user = userEvent.setup();
    mockDeleteMutateAsync.mockResolvedValueOnce(undefined);

    renderWithProviders(<AdminGalleryPage />);

    await user.click(screen.getByRole("button", { name: /ta bort/i }));

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("gallery-1");
    });
  });
});
