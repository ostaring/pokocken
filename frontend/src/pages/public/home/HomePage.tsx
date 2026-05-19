import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useGalleryImagesQuery } from "@/features/gallery/hooks/gallery-hooks";
import { useRecipesQuery } from "@/features/recipes/hooks/recipe-hooks";
import { getRecipeCategoryLabel } from "@/features/recipes/utils/recipe-utils";

export function HomePage() {
  const recipesQuery = useRecipesQuery();
  const galleryQuery = useGalleryImagesQuery();
  const recipes = recipesQuery.data ?? [];
  const featuredRecipes = recipes.slice(0, 3);
  const galleryImages = useMemo(
    () => (galleryQuery.data ?? []).slice(0, 4),
    [galleryQuery.data],
  );

  return (
    <main className="text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
        <section className="px-4 py-10 sm:px-6 sm:py-14">
          <div className="space-y-4">
            <h1 className="display-type max-w-3xl text-4xl leading-tight text-slate-950 sm:text-5xl md:text-6xl">
              Enbart för guldkäftar
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
              Recept testade och godkända av våra guldkäftar.
            </p>
          </div>
        </section>

        <section className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="break-anywhere text-xs font-semibold uppercase tracking-[0.18em] text-lime-950/70 sm:text-sm sm:tracking-[0.28em]">
                Utvalda recept
              </p>
            </div>
            <Link className="text-sm font-semibold text-slate-700 transition hover:text-slate-950" to="/recipes">
              Se alla recept
            </Link>
          </div>

          {recipesQuery.isLoading ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
              Laddar utvalda recept...
            </div>
          ) : null}

          {recipesQuery.isError ? (
            <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              Kunde inte läsa in startsidans recept just nu.
            </div>
          ) : null}

          {!recipesQuery.isLoading && !recipesQuery.isError && featuredRecipes.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {featuredRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className="overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/80 shadow-sm sm:rounded-[1.75rem]"
                >
                  <Link to={`/recipes/${recipe.slug}`}>
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        className="h-full w-full object-cover"
                        src={recipe.imageUrl}
                        alt={recipe.title}
                      />
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="rounded-full bg-stone-200 px-3 py-1 font-semibold text-stone-950">
                          {getRecipeCategoryLabel(recipe.category)}
                        </span>
                        <span className="text-slate-500">{recipe.prepTimeMinutes} min</span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-950">{recipe.title}</h3>
                        <p className="text-sm leading-6 text-slate-700">{recipe.description}</p>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-4 px-4 pb-2 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="break-anywhere text-xs font-semibold uppercase tracking-[0.18em] text-lime-950/70 sm:text-sm sm:tracking-[0.28em]">
                Inspiration
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Senaste bilderna</h2>
            </div>
            <Link className="text-sm font-semibold text-slate-700 transition hover:text-slate-950" to="/gallery">
              Se galleriet
            </Link>
          </div>

          {galleryQuery.isLoading ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
              Laddar bilder...
            </div>
          ) : null}

          {!galleryQuery.isLoading && !galleryQuery.isError && galleryImages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {galleryImages.map((image, index) => (
                <Link
                  key={image.id}
                  className={`group overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                  to="/gallery"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      src={image.imageUrl}
                      alt={image.altText}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </section>

      </div>
    </main>
  );
}
