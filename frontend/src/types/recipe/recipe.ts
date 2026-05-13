export type RecipeCategory =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Dessert"
  | "Snack";

export type RecipeSummary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: RecipeCategory;
  prepTimeMinutes: number;
  servings: number;
  imageUrl: string;
  isPublished: boolean;
};

export type RecipeDetail = RecipeSummary & {
  ingredients: string[];
  steps: string[];
};
