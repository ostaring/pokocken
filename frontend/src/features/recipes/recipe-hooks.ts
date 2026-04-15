import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminRecipeById,
  fetchAdminRecipes,
  createRecipe,
  deleteRecipe,
  fetchRecipeBySlug,
  fetchRecipes,
  toggleRecipePublished,
  updateRecipe,
} from "../../lib/api/recipes";
import { recipeQueryKeys } from "./recipe-query-keys";

type SaveRecipeMutationInput = {
  title: string;
  description: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Dessert" | "Snack";
  prepTimeMinutes: number;
  servings: number;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
  isPublished: boolean;
};

export function useRecipesQuery() {
  return useQuery({
    queryKey: recipeQueryKeys.publicAll,
    queryFn: fetchRecipes,
  });
}

export function useAdminRecipesQuery() {
  return useQuery({
    queryKey: recipeQueryKeys.adminAll,
    queryFn: fetchAdminRecipes,
  });
}

export function useRecipeBySlugQuery(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? recipeQueryKeys.detailBySlug(slug) : recipeQueryKeys.detailBySlug("missing"),
    queryFn: () => fetchRecipeBySlug(slug!),
    enabled: Boolean(slug),
  });
}

export function useRecipeByIdQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? recipeQueryKeys.detailById(id) : recipeQueryKeys.detailById("missing"),
    queryFn: () => fetchAdminRecipeById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveRecipeMutationInput) => createRecipe(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.publicAll });
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.adminAll });
    },
  });
}

export function useUpdateRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SaveRecipeMutationInput }) =>
      updateRecipe(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.publicAll });
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.adminAll });
    },
  });
}

export function useToggleRecipePublishedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleRecipePublished(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.publicAll });
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.adminAll });
    },
  });
}

export function useDeleteRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.publicAll });
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.adminAll });
    },
  });
}
