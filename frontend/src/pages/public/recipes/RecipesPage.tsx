import { useDeferredValue } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageFrame } from "@/components/layout/public/PageFrame";
import { useRecipesQuery } from "@/features/recipes/hooks/recipe-hooks";
import { getRecipeCategoryLabel } from "@/features/recipes/utils/recipe-utils";
import type { RecipeCategory } from "@/types/recipe/recipe";

function isRecipeCategory(value: string): value is RecipeCategory {
  return ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"].includes(value);
}

export function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") ?? "";
  const categoryParam = searchParams.get("category");
  const category = categoryParam && isRecipeCategory(categoryParam) ? categoryParam : "All";
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const trimmedSearchTerm = searchTerm.trim();
  const hasActiveFilters = trimmedSearchTerm.length > 0 || category !== "All";
  const recipesQuery = useRecipesQuery({
    search: deferredSearchTerm,
    category: category === "All" ? undefined : category,
  });
  const filteredRecipes = recipesQuery.data ?? [];

  function resetFilters() {
    setSearchParams({});
  }

  return (
    <PageFrame
      title="Recept att hitta tillbaka till"
      description="Bläddra bland recepten, filtrera på kategori och hitta snabbt det du vill laga eller dela vidare."
      contentVariant="plain"
    >
      <div className="space-y-8">
        {recipesQuery.isLoading ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-8 text-sm text-slate-600">
            Laddar recept...
          </div>
        ) : null}

        {recipesQuery.isError ? (
          <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
            Kunde inte läsa in recepten.
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-slate-600">
            Visar <span className="font-semibold text-slate-900">{filteredRecipes.length}</span>{" "}
            recept
          </p>
          <p className="text-sm text-slate-500">
            Spara gärna länken till dina favoriter och dela vidare.
          </p>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            {trimmedSearchTerm ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900">
                Sökning: {trimmedSearchTerm}
              </span>
            ) : null}
            {category !== "All" ? (
              <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-medium text-stone-950">
                Kategori: {getRecipeCategoryLabel(category)}
              </span>
            ) : null}
            <button
              className="rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-sm font-semibold text-slate-800 transition hover:bg-white"
              type="button"
              onClick={resetFilters}
            >
              Rensa filter
            </button>
          </div>
        ) : null}

        {!recipesQuery.isLoading && !recipesQuery.isError && filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredRecipes.map((recipe) => (
              <article
                key={recipe.id}
                className="overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/20"
              >
                <Link
                  className="block h-full"
                  to={`/recipes/${recipe.slug}`}
                  aria-label={`Öppna recept: ${recipe.title}`}
                >
                  <div className="aspect-[5/3] overflow-hidden">
                    <img
                      className="h-full w-full object-cover"
                      src={recipe.imageUrl}
                      alt={recipe.title}
                    />
                  </div>
                  <div className="space-y-3 p-3 sm:p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-stone-200 px-2.5 py-1 font-semibold text-stone-950">
                        {getRecipeCategoryLabel(recipe.category)}
                      </span>
                      <span className="text-slate-500">{recipe.prepTimeMinutes} min</span>
                      <span className="hidden text-slate-500 sm:inline">
                        {recipe.servings} portioner
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                        {recipe.title}
                      </h2>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : null}

        {!recipesQuery.isLoading && !recipesQuery.isError && filteredRecipes.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Inga recept matchade</h2>
            <p className="mt-2 text-sm text-slate-600">
              Testa ett annat sökord eller rensa filtren för att se hela listan igen.
            </p>
            <button
              className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="button"
              onClick={resetFilters}
            >
              Visa alla recept
            </button>
          </div>
        ) : null}
      </div>
    </PageFrame>
  );
}
