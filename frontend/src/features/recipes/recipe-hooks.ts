import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRecipe,
  fetchRecipeById,
  fetchRecipeBySlug,
  fetchRecipes,
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
    queryKey: recipeQueryKeys.all,
    queryFn: fetchRecipes,
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
    queryFn: () => fetchRecipeById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveRecipeMutationInput) => createRecipe(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.all });
    },
  });
}

export function useUpdateRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SaveRecipeMutationInput }) =>
      updateRecipe(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeQueryKeys.all });
    },
  });
}
