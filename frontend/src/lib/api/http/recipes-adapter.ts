import type { RecipeDetail } from "../../../types/recipe";
import { buildApiUrl } from "../http-client";
import type { SaveRecipeInput } from "../mock/recipes-adapter";
import type { RecipeFilters } from "../recipes";

export class RecipeValidationError extends Error {
  fieldErrors: Record<string, string[]>;

  constructor(fieldErrors: Record<string, string[]>) {
    super("Valideringen misslyckades.");
    this.name = "RecipeValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class AdminSessionExpiredError extends Error {
  constructor() {
    super("Adminsessionen har gått ut. Logga in igen.");
    this.name = "AdminSessionExpiredError";
  }
}

type BackendRecipeWriteRequest = SaveRecipeInput & {
  slug: string;
};

function createSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toBackendRecipeWriteRequest(input: SaveRecipeInput): BackendRecipeWriteRequest {
  return {
    ...input,
    slug: createSlug(input.title),
  };
}

function buildRecipeCollectionUrl(path: string, filters: RecipeFilters = {}) {
  const url = new URL(buildApiUrl(path));

  if (filters.search?.trim()) {
    url.searchParams.set("search", filters.search.trim());
  }

  if (filters.category) {
    url.searchParams.set("category", filters.category);
  }

  return url.toString();
}

function toSwedishValidationMessage(field: string, message: string) {
  const translations: Record<string, string> = {
    "Title is required.": "Titel krävs.",
    "Description is required.": "Beskrivning krävs.",
    "Category is required.": "Kategori krävs.",
    "Image URL is required.": "Bild-URL krävs.",
    "Image URL must be an absolute URL.": "Bildlänken måste vara en fullständig URL.",
    "Prep time must be greater than zero.": "Tillagningstiden måste vara större än 0.",
    "Servings must be greater than zero.": "Antal portioner måste vara större än 0.",
    "At least one ingredient is required.": "Lägg till minst en ingrediens.",
    "At least one step is required.": "Lägg till minst ett steg.",
    "Slug must contain lowercase letters, digits and hyphens only.":
      field === "slug"
        ? "Titeln genererar en ogiltig slug. Använd bokstäver, siffror och bindestreck."
        : "Värdet är ogiltigt.",
  };

  return translations[message] ?? message;
}

async function parseValidationError(response: Response) {
  const payload = (await response.json()) as { errors?: Record<string, string[]> };
  const fieldErrors = Object.fromEntries(
    Object.entries(payload.errors ?? {}).map(([field, messages]) => [
      field,
      messages.map((message) => toSwedishValidationMessage(field, message)),
    ]),
  );

  return new RecipeValidationError(fieldErrors);
}

export async function fetchRecipesHttp(filters: RecipeFilters = {}): Promise<RecipeDetail[]> {
  const response = await fetch(buildRecipeCollectionUrl("/api/recipes", filters));

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

export async function fetchAdminRecipesHttp(filters: RecipeFilters = {}): Promise<RecipeDetail[]> {
  const response = await fetch(buildRecipeCollectionUrl("/api/admin/recipes", filters), {
    credentials: "include",
  });

  if (response.status === 401) {
    throw new AdminSessionExpiredError();
  }

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
    throw new AdminSessionExpiredError();
  }

  if (response.status === 409) {
    throw new Error("Ett recept med den sluggen finns redan.");
  }

  if (response.status === 400) {
    throw await parseValidationError(response);
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
    throw new AdminSessionExpiredError();
  }

  if (!response.ok) {
    throw new Error("Kunde inte ta bort receptet.");
  }
}
