import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";
import { useRecipesQuery } from "../features/recipes/recipe-hooks";

export function AdminDashboardPage() {
  const recipesQuery = useRecipesQuery();
  const mockRecipes = recipesQuery.data ?? [];
  const publishedCount = mockRecipes.filter((recipe) => recipe.isPublished).length;
  const draftCount = mockRecipes.length - publishedCount;

  return (
    <PageFrame
      eyebrow="Admin"
      title="Dashboard"
      description="A first admin overview with recipe status, editing entry points, and room for future auth protection."
      actions={
        <Link
          className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          to="/admin/recipes/new"
        >
          Create recipe
        </Link>
      }
    >
      <div className="space-y-8">
        {recipesQuery.isLoading ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-8 text-sm text-slate-600">
            Loading admin recipe overview...
          </div>
        ) : null}

        {recipesQuery.isError ? (
          <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
            Could not load recipe management data.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] bg-emerald-950 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/70">Published</p>
            <p className="mt-3 text-4xl font-semibold">{publishedCount}</p>
          </div>
          <div className="rounded-[1.75rem] bg-amber-100 p-6 text-amber-950">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-800/70">Drafts</p>
            <p className="mt-3 text-4xl font-semibold">{draftCount}</p>
          </div>
          <div className="rounded-[1.75rem] bg-slate-900 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-white/60">Total recipes</p>
            <p className="mt-3 text-4xl font-semibold">{mockRecipes.length}</p>
          </div>
        </div>

        {!recipesQuery.isLoading && !recipesQuery.isError ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/80">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900">Recipe management</h2>
              <p className="mt-1 text-sm text-slate-600">
                This will map naturally to the future admin API list endpoint.
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
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Category</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{recipe.category}</p>
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
                      {recipe.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                      to={`/admin/recipes/${recipe.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      type="button"
                    >
                      {recipe.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </PageFrame>
  );
}
