export const recipeQueryKeys = {
  all: ["recipes"] as const,
  detailBySlug: (slug: string) => ["recipes", "slug", slug] as const,
  detailById: (id: string) => ["recipes", "id", id] as const,
};
