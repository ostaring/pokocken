import { Link, useParams } from "react-router-dom";
import { PageFrame } from "@/components/layout/public/PageFrame";
import { useRecipeBySlugQuery, useRecipesQuery } from "@/features/recipes/hooks/recipe-hooks";
import { getRecipeCategoryLabel } from "@/features/recipes/utils/recipe-utils";

export function RecipeDetailsPage() {
  const { slug } = useParams();
  const recipeQuery = useRecipeBySlugQuery(slug);
  const recipe = recipeQuery.data;
  const relatedRecipesQuery = useRecipesQuery({
    category: recipe?.category,
  });
  const relatedRecipes =
    relatedRecipesQuery.data?.filter((entry) => entry.id !== recipe?.id).slice(0, 3) ?? [];

  if (recipeQuery.isLoading) {
    return (
      <PageFrame eyebrow="Recept" title="Laddar recept" description="Hämtar receptdetaljer.">
        <p className="text-slate-700">Laddar receptdetaljer...</p>
      </PageFrame>
    );
  }

  if (recipeQuery.isError) {
    return (
      <PageFrame
        eyebrow="Recept"
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
        eyebrow="Recept"
        title="Receptet hittades inte"
        description="Vi kunde inte hitta något recept som matchar länken du öppnade."
      >
        <p className="text-slate-700">
          Prova att gå tillbaka till receptlistan och välj ett annat recept därifrån.
        </p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      eyebrow="Recept"
      title={recipe.title}
      description={recipe.description}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem]">
            <img className="h-full w-full object-cover" src={recipe.imageUrl} alt={recipe.title} />
          </div>

          <section className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">Ingredienser</h2>
              <p className="text-sm text-slate-500">{recipe.ingredients.length} poster</p>
            </div>
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
          <div className="rounded-[1.25rem] bg-slate-900 p-5 text-white sm:rounded-[1.75rem] sm:p-6">
            <p className="break-anywhere text-xs uppercase tracking-[0.2em] text-white/65 sm:text-sm sm:tracking-[0.3em]">
              Översikt
            </p>
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
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Ingredienser</p>
                <p className="mt-1 text-lg font-semibold">{recipe.ingredients.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Steg</p>
                <p className="mt-1 text-lg font-semibold">{recipe.steps.length}</p>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">Gör så här</h2>
              <p className="text-sm text-slate-500">{recipe.steps.length} steg</p>
            </div>
            <ol className="grid gap-4">
              {recipe.steps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-[1.5rem] border border-slate-200 bg-white/70 px-5 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-950/70">
                    Steg {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {relatedRecipes.length > 0 ? (
            <section className="space-y-4 rounded-[1.25rem] border border-slate-200 bg-white/75 p-4 sm:rounded-[1.5rem] sm:p-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-950/70">
                  Mer att laga
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Liknande recept</h2>
              </div>
              <div className="grid gap-3">
                {relatedRecipes.map((relatedRecipe) => (
                  <Link
                    key={relatedRecipe.id}
                    className="rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-lime-700 hover:bg-lime-50/60"
                    to={`/recipes/${relatedRecipe.slug}`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{relatedRecipe.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{relatedRecipe.prepTimeMinutes} min</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </PageFrame>
  );
}
