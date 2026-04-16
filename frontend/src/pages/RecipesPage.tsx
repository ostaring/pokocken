import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";
import { useRecipesQuery } from "../features/recipes/recipe-hooks";
import {
  getRecipeCategoryLabel,
  recipeCategories,
} from "../features/recipes/recipe-utils";
import type { RecipeCategory } from "../types/recipe";

export function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<RecipeCategory | "All">("All");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const trimmedSearchTerm = searchTerm.trim();
  const hasActiveFilters = trimmedSearchTerm.length > 0 || category !== "All";
  const recipesQuery = useRecipesQuery({
    search: deferredSearchTerm,
    category: category === "All" ? undefined : category,
  });
  const filteredRecipes = recipesQuery.data ?? [];

  function resetFilters() {
    setSearchTerm("");
    setCategory("All");
  }

  return (
    <PageFrame
      eyebrow="Publikt"
      title="Recept"
      description="Bladdra bland recept, filtrera pa kategori och hitta snabbt tillbaka till ratta vardagsfavorit eller helgmiddag."
      actions={
        <Link
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
          to="/"
        >
          Tillbaka till startsidan
        </Link>
      }
    >
      <div className="space-y-8">
        {recipesQuery.isLoading ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-8 text-sm text-slate-600">
            Laddar recept...
          </div>
        ) : null}

        {recipesQuery.isError ? (
          <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
            Kunde inte lasa in recepten.
          </div>
        ) : null}

        <div className="rounded-[1.75rem] border border-slate-200 bg-white/75 p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px_auto]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Sok recept</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-emerald-500"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Sok pa titel eller beskrivning"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Kategori</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                value={category}
                onChange={(event) => setCategory(event.target.value as RecipeCategory | "All")}
              >
                {recipeCategories.map((entry) => (
                  <option key={entry} value={entry}>
                    {getRecipeCategoryLabel(entry)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                className="w-full rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
              >
                Rensa filter
              </button>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {trimmedSearchTerm ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900">
                  Sokning: {trimmedSearchTerm}
                </span>
              ) : null}
              {category !== "All" ? (
                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-900">
                  Kategori: {getRecipeCategoryLabel(category)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            Visar <span className="font-semibold text-slate-900">{filteredRecipes.length}</span>{" "}
            recept
          </p>
          <p className="text-sm text-slate-500">
            Sokning och filter skickas vidare i datalagret.
          </p>
        </div>

        {!recipesQuery.isLoading && !recipesQuery.isError && filteredRecipes.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredRecipes.map((recipe) => (
              <article
                key={recipe.id}
                className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 shadow-sm"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    className="h-full w-full object-cover"
                    src={recipe.imageUrl}
                    alt={recipe.title}
                  />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-900">
                      {getRecipeCategoryLabel(recipe.category)}
                    </span>
                    <span className="text-slate-500">{recipe.prepTimeMinutes} min</span>
                    <span className="text-slate-500">{recipe.servings} portioner</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-900">{recipe.title}</h2>
                    <p className="text-sm leading-6 text-slate-700">{recipe.description}</p>
                  </div>
                  <Link
                    className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    to={`/recipes/${recipe.slug}`}
                  >
                    Oppna recept
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!recipesQuery.isLoading && !recipesQuery.isError && filteredRecipes.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Inga recept matchade</h2>
            <p className="mt-2 text-sm text-slate-600">
              Testa ett annat sokord eller rensa filtren for att se hela listan igen.
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
