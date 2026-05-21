import { FormEvent, useMemo, useState } from "react";
import { PageFrame } from "@/components/layout/public/PageFrame";
import { useCreateRecipeSuggestionsMutation } from "@/features/recipe-suggestions/hooks/recipe-suggestion-hooks";

function parseIngredients(value: string) {
  return value
    .split(/[\n,]+/)
    .map((ingredient) => ingredient.trim())
    .filter((ingredient, index, ingredients) => {
      if (!ingredient) {
        return false;
      }

      return ingredients.findIndex((entry) => entry.toLowerCase() === ingredient.toLowerCase()) === index;
    });
}

export function RecipeSuggestionsPage() {
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [servings, setServings] = useState(2);
  const [maxTimeMinutes, setMaxTimeMinutes] = useState(30);
  const suggestionMutation = useCreateRecipeSuggestionsMutation();
  const ingredients = useMemo(() => parseIngredients(ingredientsInput), [ingredientsInput]);
  const canSubmit = ingredients.length > 0 && !suggestionMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    await suggestionMutation.mutateAsync({
      ingredients,
      servings,
      maxTimeMinutes,
    });
  }

  return (
    <PageFrame
      title="Vad kan jag laga?"
      description="Skriv in råvarorna du har hemma så bygger vi grunden för receptförslag. Just nu är flödet förberett och svarar tomt tills generatorn kopplas på."
      align="center"
      contentVariant="plain"
    >
      <div className="mx-auto grid w-full max-w-3xl gap-7">
        <form className="min-w-0" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-800">Ingredienser hemma</span>
              <textarea
                className="min-h-48 w-full resize-y rounded-2xl border border-slate-900/10 bg-white/55 px-4 py-3 text-slate-900 shadow-sm shadow-slate-900/5 outline-none transition focus:border-emerald-700 focus:bg-white/75 focus:shadow-md focus:shadow-slate-900/10"
                value={ingredientsInput}
                onChange={(event) => setIngredientsInput(event.target.value)}
                placeholder="Exempel: ägg, potatis, gul lök, crème fraîche"
              />
            </label>

            {ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <span
                    className="rounded-full border border-emerald-950/10 bg-emerald-950/10 px-3 py-1 text-sm font-medium text-emerald-950"
                    key={ingredient}
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">Portioner</span>
                <input
                  className="w-full rounded-2xl border border-slate-900/10 bg-white/55 px-4 py-3 text-slate-900 shadow-sm shadow-slate-900/5 outline-none transition focus:border-emerald-700 focus:bg-white/75 focus:shadow-md focus:shadow-slate-900/10"
                  type="number"
                  min={1}
                  max={12}
                  value={servings}
                  onChange={(event) => setServings(Number(event.target.value))}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">Max tid</span>
                <select
                  className="w-full rounded-2xl border border-slate-900/10 bg-white/55 px-4 py-3 text-slate-900 shadow-sm shadow-slate-900/5 outline-none transition focus:border-emerald-700 focus:bg-white/75 focus:shadow-md focus:shadow-slate-900/10"
                  value={maxTimeMinutes}
                  onChange={(event) => setMaxTimeMinutes(Number(event.target.value))}
                >
                  <option value={15}>15 minuter</option>
                  <option value={30}>30 minuter</option>
                  <option value={45}>45 minuter</option>
                  <option value={60}>60 minuter</option>
                </select>
              </label>
            </div>

            <button
              className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition duration-200 hover:-translate-y-0.5 hover:bg-lime-950 hover:shadow-xl hover:shadow-slate-900/25 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              disabled={!canSubmit}
              type="submit"
            >
              {suggestionMutation.isPending ? "Skickar..." : "Skapa receptförslag"}
            </button>
          </div>
        </form>

        <aside className="rounded-2xl border border-lime-950/15 bg-lime-950/10 p-5 text-slate-950 shadow-lg shadow-slate-900/10 sm:p-6">
          <p className="break-anywhere text-xs font-semibold uppercase tracking-[0.18em] text-lime-950/75 sm:text-sm sm:tracking-[0.28em]">
            Förslag
          </p>
          {suggestionMutation.isIdle ? (
            <p className="mt-4 text-sm leading-7 text-slate-800">
              När du skickar ingredienserna kommer den här ytan visa matchande receptförslag.
            </p>
          ) : null}

          {suggestionMutation.isError ? (
            <p className="mt-4 rounded-2xl border border-rose-950/15 bg-rose-100/60 p-4 text-sm leading-6 text-rose-950">
              Kunde inte skapa receptförslag just nu.
            </p>
          ) : null}

          {suggestionMutation.isSuccess && suggestionMutation.data.suggestions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-lime-950/10 bg-white/35 p-4">
              <h2 className="text-base font-semibold">Generatorn är redo</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Backend svarar korrekt, men själva receptgeneratorn är inte inkopplad än.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </PageFrame>
  );
}
