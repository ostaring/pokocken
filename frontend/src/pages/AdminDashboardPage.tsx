import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { getRecipeCategoryLabel } from "../features/recipes/recipe-utils";
import {
  useAdminRecipesQuery,
  useDeleteRecipeMutation,
  useToggleRecipePublishedMutation,
} from "../features/recipes/recipe-hooks";

export function AdminDashboardPage() {
  const recipesQuery = useAdminRecipesQuery();
  const togglePublishedMutation = useToggleRecipePublishedMutation();
  const deleteRecipeMutation = useDeleteRecipeMutation();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const mockRecipes = recipesQuery.data ?? [];
  const publishedCount = mockRecipes.filter((recipe) => recipe.isPublished).length;
  const draftCount = mockRecipes.length - publishedCount;

  async function handleTogglePublished(id: string, nextActionLabel: "Publicera" | "Avpublicera") {
    setFeedbackMessage(null);
    await togglePublishedMutation.mutateAsync(id);
    setFeedbackMessage(
      nextActionLabel === "Publicera" ? "Receptet publicerades." : "Receptet flyttades tillbaka till utkast.",
    );
  }

  async function handleDeleteRecipe(id: string, title: string) {
    setFeedbackMessage(null);

    const confirmed = window.confirm(`Ta bort "${title}"? Det går inte att ångra.`);
    if (!confirmed) {
      return;
    }

    await deleteRecipeMutation.mutateAsync(id);
    setFeedbackMessage("Receptet togs bort.");
  }

  return (
    <AdminLayout
      title="Översikt"
      description="En första adminöversikt med receptstatus, ingångar till redigering och utrymme för framtida auth."
      actions={
        <Link
          className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          to="/admin/recipes/new"
        >
          Skapa recept
        </Link>
      }
    >
      <div className="space-y-8">
        {feedbackMessage ? (
          <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            {feedbackMessage}
          </div>
        ) : null}

        {togglePublishedMutation.isError || deleteRecipeMutation.isError ? (
          <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {(togglePublishedMutation.error ?? deleteRecipeMutation.error) instanceof Error
              ? (togglePublishedMutation.error ?? deleteRecipeMutation.error)?.message
              : "Kunde inte uppdatera receptets status."}
          </div>
        ) : null}

        {recipesQuery.isLoading ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-8 text-sm text-slate-600">
            Laddar adminöversikt för recept...
          </div>
        ) : null}

        {recipesQuery.isError ? (
          <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
            Kunde inte läsa in receptdata för administrationen.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] bg-emerald-950 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/70">Publicerade</p>
            <p className="mt-3 text-4xl font-semibold">{publishedCount}</p>
          </div>
          <div className="rounded-[1.75rem] bg-amber-100 p-6 text-amber-950">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-800/70">Utkast</p>
            <p className="mt-3 text-4xl font-semibold">{draftCount}</p>
          </div>
          <div className="rounded-[1.75rem] bg-slate-900 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-white/60">Totalt antal recept</p>
            <p className="mt-3 text-4xl font-semibold">{mockRecipes.length}</p>
          </div>
        </div>

        {!recipesQuery.isLoading && !recipesQuery.isError ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/80">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900">Receptadministration</h2>
              <p className="mt-1 text-sm text-slate-600">
                Detta mappar naturligt mot admin-API:ets lista över recept.
              </p>
            </div>
            <div className="divide-y divide-slate-200">
              {mockRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(0,1.5fr)_140px_140px_180px]"
                >
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{recipe.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{recipe.description}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Kategori</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{getRecipeCategoryLabel(recipe.category)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Status</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        recipe.isPublished
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {recipe.isPublished ? "Publicerat" : "Utkast"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                      to={`/admin/recipes/${recipe.id}/edit`}
                    >
                      Redigera
                    </Link>
                    <button
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      type="button"
                      onClick={() =>
                        void handleTogglePublished(
                          recipe.id,
                          recipe.isPublished ? "Avpublicera" : "Publicera",
                        )
                      }
                      disabled={togglePublishedMutation.isPending}
                    >
                      {togglePublishedMutation.isPending
                        ? "Sparar..."
                        : recipe.isPublished
                          ? "Avpublicera"
                          : "Publicera"}
                    </button>
                    <button
                      className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                      type="button"
                      onClick={() => void handleDeleteRecipe(recipe.id, recipe.title)}
                      disabled={deleteRecipeMutation.isPending || togglePublishedMutation.isPending}
                    >
                      {deleteRecipeMutation.isPending ? "Tar bort..." : "Ta bort"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
