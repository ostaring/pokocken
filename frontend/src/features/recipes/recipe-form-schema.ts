import { z } from "zod";

const recipeListItemSchema = z.object({
  value: z.string().trim().min(1, "Fältet får inte vara tomt."),
});

export const recipeFormSchema = z.object({
  title: z.string().min(3, "Titeln måste vara minst 3 tecken."),
  description: z.string().min(10, "Beskrivningen måste vara minst 10 tecken."),
  category: z.enum(["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"]),
  prepTimeMinutes: z.coerce
    .number()
    .int("Tillagningstiden måste vara ett heltal.")
    .min(0, "Tillagningstiden kan inte vara negativ."),
  servings: z.coerce
    .number()
    .int("Antal portioner måste vara ett heltal.")
    .min(1, "Antal portioner måste vara minst 1."),
  imageUrl: z.url("Bildlänken måste vara en giltig URL."),
  ingredients: z.array(recipeListItemSchema).min(1, "Lägg till minst en ingrediens."),
  steps: z.array(recipeListItemSchema).min(1, "Lägg till minst ett tillagningssteg."),
  isPublished: z.boolean(),
});

export type RecipeFormValues = z.input<typeof recipeFormSchema>;
export type RecipeFormData = z.output<typeof recipeFormSchema>;
