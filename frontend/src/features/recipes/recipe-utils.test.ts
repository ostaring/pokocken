import { describe, expect, it } from "vitest";
import { mockRecipes } from "./mock-recipes";
import { createRecipeSlug, filterRecipes, getRecipeCategoryLabel } from "./recipe-utils";

describe("filterRecipes", () => {
  it("returns all recipes when no filters are applied", () => {
    const result = filterRecipes(mockRecipes, "", "All");

    expect(result).toHaveLength(mockRecipes.length);
  });

  it("filters by search term", () => {
    const result = filterRecipes(mockRecipes, "tomat", "All");

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("rostad-tomatpasta");
  });

  it("filters by category", () => {
    const result = filterRecipes(mockRecipes, "", "Snack");

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("chilistekta-kikartor");
  });
});

describe("createRecipeSlug", () => {
  it("creates a stable slug from a Swedish recipe title", () => {
    expect(createRecipeSlug("  Fräsch pastasallad med örter!  ")).toBe(
      "frasch-pastasallad-med-orter",
    );
  });

  it("normalizes Swedish characters before building the slug", () => {
    expect(createRecipeSlug("Räkor med bröd och aioli")).toBe("rakor-med-brod-och-aioli");
  });
});

describe("getRecipeCategoryLabel", () => {
  it("returns Swedish category labels for the UI", () => {
    expect(getRecipeCategoryLabel("Dessert")).toBe("Efterrätt");
    expect(getRecipeCategoryLabel("Snack")).toBe("Mellanmål");
  });
});
