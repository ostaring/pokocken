import type { GalleryImage } from "../../types/gallery";
import { resolveAppConfig } from "../config";
import {
  createGalleryImageHttp,
  deleteGalleryImageHttp,
  fetchAdminGalleryImagesHttp,
  fetchGalleryImagesHttp,
} from "./http/gallery-adapter";
import {
  createGalleryImageMock,
  deleteGalleryImageMock,
  fetchAdminGalleryImagesMock,
  fetchGalleryImagesMock,
  type SaveGalleryImageInput,
} from "./mock/gallery-adapter";

export type { SaveGalleryImageInput } from "./mock/gallery-adapter";

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
