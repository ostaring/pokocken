import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGalleryImage,
  deleteGalleryImage,
  fetchAdminGalleryImages,
  fetchGalleryImages,
} from "@/lib/api/gallery/gallery";
import { galleryQueryKeys } from "@/features/gallery/query/gallery-query-keys";

export function useGalleryImagesQuery() {
  return useQuery({
    queryKey: galleryQueryKeys.publicList,
    queryFn: () => fetchGalleryImages(),
  });
}

export function useAdminGalleryImagesQuery() {
  return useQuery({
    queryKey: galleryQueryKeys.adminList,
    queryFn: () => fetchAdminGalleryImages(),
  });
}

export function useCreateGalleryImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { imageUrl: string; altText: string }) => createGalleryImage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.publicAll });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.adminAll });
    },
  });
}

export function useDeleteGalleryImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGalleryImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.publicAll });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.adminAll });
    },
  });
}
