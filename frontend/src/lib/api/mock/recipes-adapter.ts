import type { RecipeDetail } from "../../../types/recipe";
import { mockRecipes } from "../../../features/recipes/mock-recipes";
import { apiDelay } from "../client";
import type { RecipeFilters } from "../recipes";

const RECIPE_STORAGE_KEY = "recipe-app-recipes";

export type SaveRecipeInput = {
  title: string;
  description: string;
  category: RecipeDetail["category"];
  prepTimeMinutes: number;
  servings: number;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
  isPublished: boolean;
};

function readStoredRecipes(): RecipeDetail[] {
  const raw = window.localStorage.getItem(RECIPE_STORAGE_KEY);

  if (!raw) {
    return mockRecipes;
  }

  try {
    return JSON.parse(raw) as RecipeDetail[];
  } catch {
    window.localStorage.removeItem(RECIPE_STORAGE_KEY);
    return mockRecipes;
  }
}

function writeStoredRecipes(recipes: RecipeDetail[]) {
  window.localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
}

function createSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function filterDetailedRecipes(recipes: RecipeDetail[], filters: RecipeFilters) {
  const normalizedSearch = filters.search?.trim().toLowerCase() ?? "";

  return recipes.filter((recipe) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      recipe.title.toLowerCase().includes(normalizedSearch) ||
      recipe.description.toLowerCase().includes(normalizedSearch);

    const matchesCategory = !filters.category || recipe.category === filters.category;

    return matchesSearch && matchesCategory;
  });
}

export async function fetchRecipesMock(filters: RecipeFilters = {}): Promise<RecipeDetail[]> {
  await apiDelay();

  const publishedRecipes = readStoredRecipes().filter((recipe) => recipe.isPublished);
  return filterDetailedRecipes(publishedRecipes, filters);
}

export async function fetchAdminRecipesMock(): Promise<RecipeDetail[]> {
  await apiDelay();
  return readStoredRecipes();
}

export async function fetchRecipeBySlugMock(slug: string): Promise<RecipeDetail | undefined> {
  await apiDelay();
  return readStoredRecipes().find((recipe) => recipe.slug === slug);
}

export async function fetchAdminRecipeByIdMock(id: string): Promise<RecipeDetail | undefined> {
  await apiDelay();
  return readStoredRecipes().find((recipe) => recipe.id === id);
}

export async function createRecipeMock(input: SaveRecipeInput): Promise<RecipeDetail> {
  await apiDelay();

  const recipes = readStoredRecipes();
  const recipe: RecipeDetail = {
    id: crypto.randomUUID(),
    slug: createSlug(input.title),
    ...input,
  };

  recipes.unshift(recipe);
  writeStoredRecipes(recipes);

  return recipe;
}

export async function updateRecipeMock(id: string, input: SaveRecipeInput): Promise<RecipeDetail> {
  await apiDelay();

  const recipes = readStoredRecipes();
  const index = recipes.findIndex((recipe) => recipe.id === id);

  if (index === -1) {
    throw new Error("Recipe not found.");
  }

  const updatedRecipe: RecipeDetail = {
    ...recipes[index],
    ...input,
    slug: createSlug(input.title),
  };

  recipes[index] = updatedRecipe;
  writeStoredRecipes(recipes);

  return updatedRecipe;
}

export async function toggleRecipePublishedMock(id: string): Promise<RecipeDetail> {
  await apiDelay();

  const recipes = readStoredRecipes();
  const index = recipes.findIndex((recipe) => recipe.id === id);

  if (index === -1) {
    throw new Error("Recipe not found.");
  }

  const updatedRecipe: RecipeDetail = {
    ...recipes[index],
    isPublished: !recipes[index].isPublished,
  };

  recipes[index] = updatedRecipe;
  writeStoredRecipes(recipes);

  return updatedRecipe;
}

export async function deleteRecipeMock(id: string): Promise<void> {
  await apiDelay();

  const recipes = readStoredRecipes();
  const nextRecipes = recipes.filter((recipe) => recipe.id !== id);

  if (nextRecipes.length === recipes.length) {
    throw new Error("Recipe not found.");
  }

  writeStoredRecipes(nextRecipes);
}
