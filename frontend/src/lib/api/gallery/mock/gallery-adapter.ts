import type { GalleryImage } from "@/types/gallery/gallery";
import { mockGalleryImages } from "@/features/gallery/fixtures/mock-gallery";
import { apiDelay } from "@/lib/api/shared/client";

const GALLERY_STORAGE_KEY = "recipe-app-gallery";

export type SaveGalleryImageInput = {
  imageUrl: string;
  altText: string;
};

function readStoredGalleryImages(): GalleryImage[] {
  const raw = window.localStorage.getItem(GALLERY_STORAGE_KEY);

  if (!raw) {
    return mockGalleryImages;
  }

  try {
    return JSON.parse(raw) as GalleryImage[];
  } catch {
    window.localStorage.removeItem(GALLERY_STORAGE_KEY);
    return mockGalleryImages;
  }
}

function writeStoredGalleryImages(images: GalleryImage[]) {
  window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(images));
}

export async function fetchGalleryImagesMock(): Promise<GalleryImage[]> {
  await apiDelay();

  return readStoredGalleryImages()
    .slice()
    .sort((left, right) => right.createdAtUtc.localeCompare(left.createdAtUtc));
}

export async function fetchAdminGalleryImagesMock(): Promise<GalleryImage[]> {
  return fetchGalleryImagesMock();
}

export async function createGalleryImageMock(input: SaveGalleryImageInput): Promise<GalleryImage> {
  await apiDelay();

  if (!input.imageUrl.trim()) {
    throw new Error("Bild-URL krävs.");
  }

  if (!input.altText.trim()) {
    throw new Error("Beskrivning krävs.");
  }

  const images = readStoredGalleryImages();
  const createdImage: GalleryImage = {
    id: crypto.randomUUID(),
    imageUrl: input.imageUrl.trim(),
    altText: input.altText.trim(),
    createdAtUtc: new Date().toISOString(),
  };

  images.unshift(createdImage);
  writeStoredGalleryImages(images);

  return createdImage;
}

export async function deleteGalleryImageMock(id: string): Promise<void> {
  await apiDelay();

  const images = readStoredGalleryImages();
  const nextImages = images.filter((image) => image.id !== id);

  if (nextImages.length === images.length) {
    throw new Error("Galleribilden hittades inte.");
  }

  writeStoredGalleryImages(nextImages);
}
