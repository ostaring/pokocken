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

function shouldUseHttpApi() {
  return resolveAppConfig().apiMode === "http";
}

export async function fetchRecipes(filters: RecipeFilters = {}): Promise<RecipeDetail[]> {
  return shouldUseHttpApi() ? fetchRecipesHttp(filters) : fetchRecipesMock(filters);
}

export async function fetchAdminRecipes(filters: RecipeFilters = {}): Promise<RecipeDetail[]> {
  return shouldUseHttpApi() ? fetchAdminRecipesHttp(filters) : fetchAdminRecipesMock(filters);
}

export async function fetchRecipeBySlug(slug: string): Promise<RecipeDetail | undefined> {
  return shouldUseHttpApi() ? fetchRecipeBySlugHttp(slug) : fetchRecipeBySlugMock(slug);
}

export async function fetchAdminRecipeById(id: string): Promise<RecipeDetail | undefined> {
  return shouldUseHttpApi() ? fetchAdminRecipeByIdHttp(id) : fetchAdminRecipeByIdMock(id);
}

export async function createRecipe(input: SaveRecipeInput): Promise<RecipeDetail> {
  return shouldUseHttpApi() ? createRecipeHttp(input) : createRecipeMock(input);
}

export async function updateRecipe(id: string, input: SaveRecipeInput): Promise<RecipeDetail> {
  return shouldUseHttpApi() ? updateRecipeHttp(id, input) : updateRecipeMock(id, input);
}

export async function toggleRecipePublished(id: string): Promise<RecipeDetail> {
  return shouldUseHttpApi() ? toggleRecipePublishedHttp(id) : toggleRecipePublishedMock(id);
}

export async function deleteRecipe(id: string): Promise<void> {
  return shouldUseHttpApi() ? deleteRecipeHttp(id) : deleteRecipeMock(id);
}
