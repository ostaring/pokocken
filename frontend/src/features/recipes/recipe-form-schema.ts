import { z } from "zod";

export const recipeFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.enum(["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"]),
  prepTimeMinutes: z.coerce
    .number()
    .int("Prep time must be a whole number.")
    .min(0, "Prep time cannot be negative."),
  servings: z.coerce
    .number()
    .int("Servings must be a whole number.")
    .min(1, "Servings must be at least 1."),
  imageUrl: z.url("Image URL must be a valid URL."),
  ingredientsText: z.string().min(10, "Add at least one ingredient."),
  stepsText: z.string().min(10, "Add at least one cooking step."),
  isPublished: z.boolean(),
});

export type RecipeFormValues = z.input<typeof recipeFormSchema>;
export type RecipeFormData = z.output<typeof recipeFormSchema>;
