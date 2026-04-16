export const recipeQueryKeys = {
  all: ["recipes"] as const,
  publicAll: ["recipes", "public"] as const,
  publicList: (search: string, category: string) =>
    ["recipes", "public", "list", search, category] as const,
  adminAll: ["recipes", "admin"] as const,
  detailBySlug: (slug: string) => ["recipes", "public", "slug", slug] as const,
  detailById: (id: string) => ["recipes", "admin", "id", id] as const,
};
