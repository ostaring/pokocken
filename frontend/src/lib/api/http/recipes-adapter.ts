import type { RecipeDetail } from "../../../types/recipe";
import { buildApiUrl } from "../http-client";
import type { SaveRecipeInput } from "../mock/recipes-adapter";

type BackendRecipeWriteRequest = SaveRecipeInput & {
  slug: string;
};

function createSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toBackendRecipeWriteRequest(input: SaveRecipeInput): BackendRecipeWriteRequest {
  return {
    ...input,
    slug: createSlug(input.title),
  };
}

export async function fetchRecipesHttp(): Promise<RecipeDetail[]> {
  const response = await fetch(buildApiUrl("/api/recipes"));

  if (!response.ok) {
    throw new Error("Kunde inte hämta recepten.");
  }

  return (await response.json()) as RecipeDetail[];
}

export async function fetchRecipeBySlugHttp(slug: string): Promise<RecipeDetail | undefined> {
  const response = await fetch(buildApiUrl(`/api/recipes/${slug}`));

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error("Kunde inte hämta receptet.");
  }

  return (await response.json()) as RecipeDetail;
}

export async function fetchAdminRecipesHttp(): Promise<RecipeDetail[]> {
  const response = await fetch(buildApiUrl("/api/admin/recipes"), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Kunde inte hämta adminrecepten.");
  }

  return (await response.json()) as RecipeDetail[];
}

export async function fetchAdminRecipeByIdHttp(id: string): Promise<RecipeDetail | undefined> {
  const recipes = await fetchAdminRecipesHttp();
  return recipes.find((recipe) => recipe.id === id);
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
    body: JSON.stringify(toBackendRecipeWriteRequest(input)),
  });

  if (response.status === 401) {
    throw new Error("Adminsessionen har gått ut. Logga in igen.");
  }

  if (response.status === 409) {
    throw new Error("Ett recept med den sluggen finns redan.");
  }

  if (!response.ok) {
    throw new Error("Kunde inte spara receptet.");
  }

  return (await response.json()) as RecipeDetail;
}

export function createRecipeHttp(input: SaveRecipeInput) {
  return sendRecipeWriteRequest("/api/admin/recipes", "POST", input);
}

export async function updateRecipeHttp(id: string, input: SaveRecipeInput) {
  const recipe = await fetchAdminRecipeByIdHttp(id);

  if (!recipe) {
    throw new Error("Receptet hittades inte.");
  }

  return sendRecipeWriteRequest(`/api/admin/recipes/${recipe.slug}`, "PUT", input);
}

export async function toggleRecipePublishedHttp(id: string): Promise<RecipeDetail> {
  const recipe = await fetchAdminRecipeByIdHttp(id);

  if (!recipe) {
    throw new Error("Receptet hittades inte.");
  }

  return sendRecipeWriteRequest(`/api/admin/recipes/${recipe.slug}`, "PUT", {
    title: recipe.title,
    description: recipe.description,
    category: recipe.category,
    prepTimeMinutes: recipe.prepTimeMinutes,
    servings: recipe.servings,
    imageUrl: recipe.imageUrl,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    isPublished: !recipe.isPublished,
  });
}

export async function deleteRecipeHttp(id: string): Promise<void> {
  const recipe = await fetchAdminRecipeByIdHttp(id);

  if (!recipe) {
    throw new Error("Receptet hittades inte.");
  }

  const response = await fetch(buildApiUrl(`/api/admin/recipes/${recipe.slug}`), {
    method: "DELETE",
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error("Adminsessionen har gått ut. Logga in igen.");
  }

  if (!response.ok) {
    throw new Error("Kunde inte ta bort receptet.");
  }
}
