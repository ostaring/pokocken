import type { RecipeCategory, RecipeSummary } from "../../types/recipe";

export const recipeCategories: Array<RecipeCategory | "All"> = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snack",
];

export function getRecipeCategoryLabel(category: RecipeCategory | "All") {
  switch (category) {
    case "All":
      return "Alla";
    case "Breakfast":
      return "Frukost";
    case "Lunch":
      return "Lunch";
    case "Dinner":
      return "Middag";
    case "Dessert":
      return "Efterratt";
    case "Snack":
      return "Mellanmal";
  }
}

export function createRecipeSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function filterRecipes(
  recipes: RecipeSummary[],
  searchTerm: string,
  category: RecipeCategory | "All",
) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return recipes.filter((recipe) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      recipe.title.toLowerCase().includes(normalizedSearch) ||
      recipe.description.toLowerCase().includes(normalizedSearch);

    const matchesCategory = category === "All" || recipe.category === category;

    return matchesSearch && matchesCategory;
  });
}
