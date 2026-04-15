import { useParams } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";
import { getRecipeBySlug } from "../features/recipes/recipe-service";

export function RecipeDetailsPage() {
  const { slug } = useParams();
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    return (
      <PageFrame
        eyebrow="Public"
        title="Recipe not found"
        description="We could not find a recipe matching that slug."
      >
        <p className="text-slate-700">
          This route is ready for backend-driven not-found handling later on.
        </p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      eyebrow="Public"
      title={recipe.title}
      description={recipe.description}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem]">
            <img className="h-full w-full object-cover" src={recipe.imageUrl} alt={recipe.title} />
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Ingredients</h2>
            <ul className="grid gap-3">
              {recipe.ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700"
                >
                  {ingredient}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[1.75rem] bg-slate-900 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-white/65">Overview</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Category</p>
                <p className="mt-1 text-lg font-semibold">{recipe.category}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Prep time</p>
                <p className="mt-1 text-lg font-semibold">{recipe.prepTimeMinutes} min</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Servings</p>
                <p className="mt-1 text-lg font-semibold">{recipe.servings}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Status</p>
                <p className="mt-1 text-lg font-semibold">
                  {recipe.isPublished ? "Published" : "Draft"}
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Method</h2>
            <ol className="grid gap-4">
              {recipe.steps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-[1.5rem] border border-slate-200 bg-white/70 px-5 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800/70">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </PageFrame>
  );
}
