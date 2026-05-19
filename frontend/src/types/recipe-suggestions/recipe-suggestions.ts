export type RecipeSuggestionRequest = {
  ingredients: string[];
  servings: number;
  maxTimeMinutes: number;
};

export type RecipeSuggestion = {
  title: string;
  description: string;
  usedIngredients: string[];
  missingIngredients: string[];
  steps: string[];
};

export type RecipeSuggestionResponse = {
  suggestions: RecipeSuggestion[];
};
