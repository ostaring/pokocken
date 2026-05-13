import type { RecipeDetail } from "@/types/recipe/recipe";
import type { RecipeCategory } from "@/types/recipe/recipe";
import { resolveAppConfig } from "@/lib/config/config";
import {
  createRecipeHttp,
  deleteRecipeHttp,
  fetchAdminRecipeByIdHttp,
  fetchAdminRecipesHttp,
  fetchRecipeBySlugHttp,
  fetchRecipesHttp,
  toggleRecipePublishedHttp,
  updateRecipeHttp,
} from "@/lib/api/recipes/http/recipes-adapter";
import {
  createRecipeMock,
  deleteRecipeMock,
  fetchAdminRecipeByIdMock,
  fetchAdminRecipesMock,
  fetchRecipeBySlugMock,
  fetchRecipesMock,
  toggleRecipePublishedMock,
  updateRecipeMock,
  type SaveRecipeInput,
} from "@/lib/api/recipes/mock/recipes-adapter";

export type { SaveRecipeInput } from "@/lib/api/recipes/mock/recipes-adapter";
export type RecipeFilters = {
  search?: string;
  category?: RecipeCategory;
};

function useHttpApi() {
  return resolveAppConfig().apiMode === "http";
}

export async function fetchRecipes(filters: RecipeFilters = {}): Promise<RecipeDetail[]> {
  return useHttpApi() ? fetchRecipesHttp(filters) : fetchRecipesMock(filters);
}

export async function fetchAdminRecipes(filters: RecipeFilters = {}): Promise<RecipeDetail[]> {
  return useHttpApi() ? fetchAdminRecipesHttp(filters) : fetchAdminRecipesMock(filters);
}

export async function fetchRecipeBySlug(slug: string): Promise<RecipeDetail | undefined> {
  return useHttpApi() ? fetchRecipeBySlugHttp(slug) : fetchRecipeBySlugMock(slug);
}

export async function fetchAdminRecipeById(id: string): Promise<RecipeDetail | undefined> {
  return useHttpApi() ? fetchAdminRecipeByIdHttp(id) : fetchAdminRecipeByIdMock(id);
}

export async function createRecipe(input: SaveRecipeInput): Promise<RecipeDetail> {
  return useHttpApi() ? createRecipeHttp(input) : createRecipeMock(input);
}

export async function updateRecipe(id: string, input: SaveRecipeInput): Promise<RecipeDetail> {
  return useHttpApi() ? updateRecipeHttp(id, input) : updateRecipeMock(id, input);
}

export async function toggleRecipePublished(id: string): Promise<RecipeDetail> {
  return useHttpApi() ? toggleRecipePublishedHttp(id) : toggleRecipePublishedMock(id);
}

export async function deleteRecipe(id: string): Promise<void> {
  return useHttpApi() ? deleteRecipeHttp(id) : deleteRecipeMock(id);
}
