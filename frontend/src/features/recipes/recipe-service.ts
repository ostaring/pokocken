import { mockRecipes } from "./mock-recipes";

export function getAllRecipes() {
  return mockRecipes;
}

export function getRecipeBySlug(slug: string | undefined) {
  if (!slug) {
    return undefined;
  }

  return mockRecipes.find((recipe) => recipe.slug === slug);
}

export function getRecipeById(id: string | undefined) {
  if (!id) {
    return undefined;
  }

  return mockRecipes.find((recipe) => recipe.id === id);
}
