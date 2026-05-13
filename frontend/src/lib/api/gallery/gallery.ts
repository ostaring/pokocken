import type { GalleryImage } from "@/types/gallery/gallery";
import { resolveAppConfig } from "@/lib/config/config";
import {
  createGalleryImageHttp,
  deleteGalleryImageHttp,
  fetchAdminGalleryImagesHttp,
  fetchGalleryImagesHttp,
} from "@/lib/api/gallery/http/gallery-adapter";
import {
  createGalleryImageMock,
  deleteGalleryImageMock,
  fetchAdminGalleryImagesMock,
  fetchGalleryImagesMock,
  type SaveGalleryImageInput,
} from "@/lib/api/gallery/mock/gallery-adapter";

export type { SaveGalleryImageInput } from "@/lib/api/gallery/mock/gallery-adapter";

function useHttpApi() {
  return resolveAppConfig().apiMode === "http";
}

export async function fetchGalleryImages(): Promise<GalleryImage[]> {
  return useHttpApi() ? fetchGalleryImagesHttp() : fetchGalleryImagesMock();
}

export async function fetchAdminGalleryImages(): Promise<GalleryImage[]> {
  return useHttpApi() ? fetchAdminGalleryImagesHttp() : fetchAdminGalleryImagesMock();
}

export async function createGalleryImage(input: SaveGalleryImageInput): Promise<GalleryImage> {
  return useHttpApi() ? createGalleryImageHttp(input) : createGalleryImageMock(input);
}

export async function deleteGalleryImage(id: string): Promise<void> {
  return useHttpApi() ? deleteGalleryImageHttp(id) : deleteGalleryImageMock(id);
}
