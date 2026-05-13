import { Link } from "react-router-dom";
import { PageFrame } from "@/components/layout/public/PageFrame";
import { useRecipesQuery } from "@/features/recipes/hooks/recipe-hooks";
import { getRecipeCategoryLabel } from "@/features/recipes/utils/recipe-utils";

export function HomePage() {
  const recipesQuery = useRecipesQuery();
  const featuredRecipes = recipesQuery.data?.slice(0, 3) ?? [];

  return (
    <PageFrame
      eyebrow="Pokocken"
      title="Recept samlade för vardag, helg och allt däremellan."
      description="Här finns recepten jag vill kunna dela med familj och vänner utan att behöva skriva om dem varje gång. Enkelt att hitta tillbaka till, lätt att laga från."
      actions={
        <>
          <Link
            className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:text-white focus-visible:text-white"
            to="/recipes"
          >
            Utforska recept
          </Link>
          <Link
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white/70"
            to="/gallery"
          >
            Se galleriet
          </Link>
        </>
      }
    >
      <div className="space-y-8">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="rounded-[1.75rem] bg-slate-900 px-6 py-7 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">
              För familj och vänner
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Alla favoriter på ett ställe</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
              Pokocken är min egen receptsamling för sådant jag vill laga igen och kunna dela vidare.
              Här ska det vara lätt att hitta rätt rätt, se ingredienserna direkt och följa stegen utan
              att behöva leta bland gamla chattar, anteckningar eller lösa länkar.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">Lätt att dela</p>
                <p className="mt-2 text-sm text-white/70">
                  Skicka en länk i stället för att skriva om receptet från början.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">Tydliga steg</p>
                <p className="mt-2 text-sm text-white/70">
                  Ingredienser, tid och tillagning finns samlat i ett lugnt format.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">Matgalleri</p>
                <p className="mt-2 text-sm text-white/70">
                  Små köksögonblick får också en egen plats när recepten inte räcker till.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-800/70">
              Så använder du sidan
            </p>
            <ol className="mt-5 space-y-4">
              <li className="rounded-2xl bg-emerald-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">1. Bläddra bland recepten</p>
                <p className="mt-1 text-sm text-slate-600">
                  Börja i receptlistan och filtrera fram det som passar dagen.
                </p>
              </li>
              <li className="rounded-2xl bg-orange-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">2. Öppna det du vill laga</p>
                <p className="mt-1 text-sm text-slate-600">
                  Se tid, portioner, ingredienser och tillagningssteg samlat på ett ställe.
                </p>
              </li>
              <li className="rounded-2xl bg-slate-100 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">3. Kika i galleriet</p>
                <p className="mt-1 text-sm text-slate-600">
                  När du bara vill ha inspiration kan du bläddra bland matbilderna och förstora dem.
                </p>
              </li>
            </ol>
          </aside>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-800/70">
                Utvalda recept
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Börja här</h2>
            </div>
            <Link
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
              to="/recipes"
            >
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
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-slate-900">{recipe.title}</h3>
                      <p className="text-sm leading-6 text-slate-700">{recipe.description}</p>
                    </div>
                    <Link
                      className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:text-white focus-visible:text-white"
                      to={`/recipes/${recipe.slug}`}
                    >
                      Öppna recept
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </PageFrame>
  );
}
