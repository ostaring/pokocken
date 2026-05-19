import { resolveAppConfig } from "@/lib/config/config";
import { buildApiUrl } from "@/lib/api/shared/http-client";
import type {
  RecipeSuggestionRequest,
  RecipeSuggestionResponse,
} from "@/types/recipe-suggestions/recipe-suggestions";

const emptyResponse: RecipeSuggestionResponse = {
  suggestions: [],
};

function shouldUseHttpApi() {
  return resolveAppConfig().apiMode === "http";
}

export async function createRecipeSuggestions(
  input: RecipeSuggestionRequest,
): Promise<RecipeSuggestionResponse> {
  if (!shouldUseHttpApi()) {
    return emptyResponse;
  }

  const response = await fetch(buildApiUrl("/api/recipe-suggestions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Kunde inte skapa receptförslag just nu.");
  }

  return (await response.json()) as RecipeSuggestionResponse;
}
