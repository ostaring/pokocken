import { describe, expect, it } from "vitest";
import { mockRecipes } from "./mock-recipes";
import { filterRecipes } from "./recipe-utils";

describe("filterRecipes", () => {
  it("returns all recipes when no filters are applied", () => {
    const result = filterRecipes(mockRecipes, "", "All");

    expect(result).toHaveLength(mockRecipes.length);
  });

  it("filters by search term", () => {
    const result = filterRecipes(mockRecipes, "pasta", "All");

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("roasted-tomato-pasta");
  });

  it("filters by category", () => {
    const result = filterRecipes(mockRecipes, "", "Snack");

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("chili-lime-roasted-chickpeas");
  });
});
