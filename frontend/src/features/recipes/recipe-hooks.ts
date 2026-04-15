import { useQuery } from "@tanstack/react-query";
import { fetchRecipeById, fetchRecipeBySlug, fetchRecipes } from "../../lib/api/recipes";
import { recipeQueryKeys } from "./recipe-query-keys";

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
