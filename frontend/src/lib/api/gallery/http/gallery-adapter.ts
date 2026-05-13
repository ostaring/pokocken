import type { GalleryImage } from "@/types/gallery/gallery";
import { buildApiUrl } from "@/lib/api/shared/http-client";
import { AdminSessionExpiredError } from "@/lib/api/recipes/http/recipes-adapter";

export async function fetchGalleryImagesHttp(): Promise<GalleryImage[]> {
  const response = await fetch(buildApiUrl("/api/gallery"));

  if (!response.ok) {
    throw new Error("Kunde inte hämta galleribilderna.");
  }

  return (await response.json()) as GalleryImage[];
}

export async function fetchAdminGalleryImagesHttp(): Promise<GalleryImage[]> {
  const response = await fetch(buildApiUrl("/api/admin/gallery"), {
    credentials: "include",
  });

  if (response.status === 401) {
    throw new AdminSessionExpiredError();
  }

  if (!response.ok) {
    throw new Error("Kunde inte hämta galleribilderna för administrationen.");
  }

  return (await response.json()) as GalleryImage[];
}

export async function createGalleryImageHttp(input: {
  imageUrl: string;
  altText: string;
}): Promise<GalleryImage> {
  const response = await fetch(buildApiUrl("/api/admin/gallery"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUrl: input.imageUrl.trim(),
      altText: input.altText.trim(),
    }),
  });

  if (response.status === 401) {
    throw new AdminSessionExpiredError();
  }

  if (response.status === 400) {
    const payload = (await response.json()) as { message?: string };
    throw new Error(payload.message ?? "Kunde inte spara galleribilden.");
  }

  if (!response.ok) {
    throw new Error("Kunde inte spara galleribilden.");
  }

  return (await response.json()) as GalleryImage;
}

export async function deleteGalleryImageHttp(id: string): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/admin/gallery/${id}`), {
    method: "DELETE",
    credentials: "include",
  });

  if (response.status === 401) {
    throw new AdminSessionExpiredError();
  }

  if (!response.ok) {
    throw new Error("Kunde inte ta bort galleribilden.");
  }
}
