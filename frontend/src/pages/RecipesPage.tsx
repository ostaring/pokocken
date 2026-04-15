import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";
import { useRecipesQuery } from "../features/recipes/recipe-hooks";
import {
  filterRecipes,
  getRecipeCategoryLabel,
  recipeCategories,
} from "../features/recipes/recipe-utils";
import type { RecipeCategory } from "../types/recipe";

export function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<RecipeCategory | "All">("All");
  const recipesQuery = useRecipesQuery();
  const recipes = recipesQuery.data ?? [];

  const filteredRecipes = useMemo(
    () => filterRecipes(recipes, searchTerm, category),
    [category, recipes, searchTerm],
  );

  return (
    <PageFrame
      eyebrow="Publikt"
      title="Recept"
      description="En första riktig bläddringsvy med sökning och kategorifilter i klienten. Senare kan vi byta mockdata mot backenddata utan att ändra sidans struktur särskilt mycket."
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

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Sök recept</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-emerald-500"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Sök på titel eller beskrivning"
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
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            Visar <span className="font-semibold text-slate-900">{filteredRecipes.length}</span>{" "}
            recept
          </p>
          <p className="text-sm text-slate-500">Mockdata just nu, API-redo struktur redan nu.</p>
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
                    Öppna recept
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
              Testa ett annat sökord eller återställ kategorifiltret.
            </p>
          </div>
        ) : null}
      </div>
    </PageFrame>
  );
}
