import type { RecipeDetail } from "../../../types/recipe";
import { buildApiUrl } from "../http-client";
import type { SaveRecipeInput } from "../mock/recipes-adapter";

export async function fetchRecipesHttp(): Promise<RecipeDetail[]> {
  const response = await fetch(buildApiUrl("/api/recipes"));

  if (!response.ok) {
    throw new Error("Failed to fetch recipes.");
  }

  return (await response.json()) as RecipeDetail[];
}

export async function fetchRecipeBySlugHttp(slug: string): Promise<RecipeDetail | undefined> {
  const response = await fetch(buildApiUrl(`/api/recipes/${slug}`));

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch recipe.");
  }

  return (await response.json()) as RecipeDetail;
}

export async function fetchRecipeByIdHttp(id: string): Promise<RecipeDetail | undefined> {
  const response = await fetch(buildApiUrl(`/api/admin/recipes/${id}`), {
    credentials: "include",
  });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch admin recipe.");
  }

  return (await response.json()) as RecipeDetail;
}

async function sendRecipeWriteRequest(
  path: string,
  method: "POST" | "PUT",
  input: SaveRecipeInput,
): Promise<RecipeDetail> {
  const response = await fetch(buildApiUrl(path), {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to save recipe.");
  }

  return (await response.json()) as RecipeDetail;
}

export function createRecipeHttp(input: SaveRecipeInput) {
  return sendRecipeWriteRequest("/api/admin/recipes", "POST", input);
}

export function updateRecipeHttp(id: string, input: SaveRecipeInput) {
  return sendRecipeWriteRequest(`/api/admin/recipes/${id}`, "PUT", input);
}

export async function toggleRecipePublishedHttp(id: string): Promise<RecipeDetail> {
  const response = await fetch(buildApiUrl(`/api/admin/recipes/${id}/toggle-publish`), {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to update recipe status.");
  }

  return (await response.json()) as RecipeDetail;
}

export async function deleteRecipeHttp(id: string): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/admin/recipes/${id}`), {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete recipe.");
  }
}
