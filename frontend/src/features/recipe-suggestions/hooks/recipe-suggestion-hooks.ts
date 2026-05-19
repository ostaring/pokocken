import { useMutation } from "@tanstack/react-query";
import { createRecipeSuggestions } from "@/lib/api/recipe-suggestions/recipe-suggestions";
import type { RecipeSuggestionRequest } from "@/types/recipe-suggestions/recipe-suggestions";

export function useCreateRecipeSuggestionsMutation() {
  return useMutation({
    mutationFn: (input: RecipeSuggestionRequest) => createRecipeSuggestions(input),
  });
}
