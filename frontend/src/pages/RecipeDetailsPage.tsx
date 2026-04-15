import { useParams } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";
import { useRecipeBySlugQuery } from "../features/recipes/recipe-hooks";
import { getRecipeCategoryLabel } from "../features/recipes/recipe-utils";

export function RecipeDetailsPage() {
  const { slug } = useParams();
  const recipeQuery = useRecipeBySlugQuery(slug);
  const recipe = recipeQuery.data;

  if (recipeQuery.isLoading) {
    return (
      <PageFrame eyebrow="Publikt" title="Laddar recept" description="Hämtar receptdetaljer.">
        <p className="text-slate-700">Laddar receptdetaljer...</p>
      </PageFrame>
    );
  }

  if (recipeQuery.isError) {
    return (
      <PageFrame
        eyebrow="Publikt"
        title="Receptet är inte tillgängligt"
        description="Något gick fel när receptet skulle laddas."
      >
        <p className="text-slate-700">Försök igen lite senare.</p>
      </PageFrame>
    );
  }

  if (!recipe) {
    return (
      <PageFrame
        eyebrow="Publikt"
        title="Receptet hittades inte"
        description="Vi kunde inte hitta något recept som matchar den här sluggen."
      >
        <p className="text-slate-700">
          Den här routen är redo för backenddriven hantering av saknade recept senare.
        </p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      eyebrow="Publikt"
      title={recipe.title}
      description={recipe.description}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem]">
            <img className="h-full w-full object-cover" src={recipe.imageUrl} alt={recipe.title} />
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Ingredienser</h2>
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
            <p className="text-sm uppercase tracking-[0.3em] text-white/65">Översikt</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Kategori</p>
                <p className="mt-1 text-lg font-semibold">{getRecipeCategoryLabel(recipe.category)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Tillagningstid</p>
                <p className="mt-1 text-lg font-semibold">{recipe.prepTimeMinutes} min</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Portioner</p>
                <p className="mt-1 text-lg font-semibold">{recipe.servings}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Status</p>
                <p className="mt-1 text-lg font-semibold">
                  {recipe.isPublished ? "Publicerat" : "Utkast"}
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Gör så här</h2>
            <ol className="grid gap-4">
              {recipe.steps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-[1.5rem] border border-slate-200 bg-white/70 px-5 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800/70">
                    Steg {index + 1}
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
