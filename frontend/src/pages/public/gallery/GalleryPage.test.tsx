import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GalleryPage } from "@/pages/public/gallery/GalleryPage";
import { renderWithMemoryRouter } from "@/test/utils/render";

const mockUseGalleryImagesQuery = vi.fn();

vi.mock("@/features/gallery/hooks/gallery-hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/gallery/hooks/gallery-hooks")>(
    "@/features/gallery/hooks/gallery-hooks",
  );

  return {
    ...actual,
    useGalleryImagesQuery: () => mockUseGalleryImagesQuery(),
  };
});

describe("GalleryPage", () => {
  it("shows a loading state while gallery images are fetched", () => {
    mockUseGalleryImagesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithMemoryRouter(<GalleryPage />, ["/gallery"]);

    expect(screen.getByText("Laddar galleriet...")).toBeInTheDocument();
  });

  it("renders gallery images and opens a lightbox when a tile is clicked", async () => {
    const user = userEvent.setup();
    mockUseGalleryImagesQuery.mockReturnValue({
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
    });

    renderWithMemoryRouter(<GalleryPage />, ["/gallery"]);

    await user.click(screen.getByRole("button", { name: /tallrik med nygjord pasta/i }));

    expect(
      screen.getByRole("dialog", { name: /förstorad bild: tallrik med nygjord pasta/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /stäng/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
