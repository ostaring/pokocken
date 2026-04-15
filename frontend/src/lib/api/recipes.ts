import type { RecipeDetail } from "../../types/recipe";
import { mockRecipes } from "../../features/recipes/mock-recipes";
import { apiDelay } from "./client";

export async function fetchRecipes(): Promise<RecipeDetail[]> {
  await apiDelay();
  return mockRecipes;
}

export async function fetchRecipeBySlug(slug: string): Promise<RecipeDetail | undefined> {
  await apiDelay();
  return mockRecipes.find((recipe) => recipe.slug === slug);
}

export async function fetchRecipeById(id: string): Promise<RecipeDetail | undefined> {
  await apiDelay();
  return mockRecipes.find((recipe) => recipe.id === id);
}
