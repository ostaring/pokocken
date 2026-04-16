import { z } from "zod";

const recipeListItemSchema = z.object({
  value: z.string().trim().min(1, "Faltet far inte vara tomt."),
});

export const recipeFormSchema = z.object({
  title: z.string().min(3, "Titeln maste vara minst 3 tecken."),
  description: z.string().min(10, "Beskrivningen maste vara minst 10 tecken."),
  category: z.enum(["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"]),
  prepTimeMinutes: z.coerce
    .number()
    .int("Tillagningstiden maste vara ett heltal.")
    .min(0, "Tillagningstiden kan inte vara negativ."),
  servings: z.coerce
    .number()
    .int("Antal portioner maste vara ett heltal.")
    .min(1, "Antal portioner maste vara minst 1."),
  imageUrl: z.url("Bildlanken maste vara en giltig URL."),
  ingredients: z.array(recipeListItemSchema).min(1, "Lagg till minst en ingrediens."),
  steps: z.array(recipeListItemSchema).min(1, "Lagg till minst ett tillagningssteg."),
  isPublished: z.boolean(),
});

export type RecipeFormValues = z.input<typeof recipeFormSchema>;
export type RecipeFormData = z.output<typeof recipeFormSchema>;
