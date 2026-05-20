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
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form
          className="rounded-[1.25rem] border border-slate-200 bg-white/75 p-4 sm:rounded-[1.75rem] sm:p-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Ingredienser hemma</span>
              <textarea
                className="min-h-44 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                value={ingredientsInput}
                onChange={(event) => setIngredientsInput(event.target.value)}
                placeholder="Exempel: ägg, potatis, gul lök, crème fraîche"
              />
            </label>

            {ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <span
                    className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900"
                    key={ingredient}
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Portioner</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                  type="number"
                  min={1}
                  max={12}
                  value={servings}
                  onChange={(event) => setServings(Number(event.target.value))}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Max tid</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
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
              className="w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              disabled={!canSubmit}
              type="submit"
            >
              {suggestionMutation.isPending ? "Skickar..." : "Skapa receptförslag"}
            </button>
          </div>
        </form>

        <aside className="rounded-[1.25rem] border border-slate-200 bg-slate-900 p-5 text-white sm:rounded-[1.75rem] sm:p-6">
          <p className="break-anywhere text-xs font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-sm sm:tracking-[0.28em]">
            Förslag
          </p>
          {suggestionMutation.isIdle ? (
            <p className="mt-4 text-sm leading-7 text-white/75">
              När du skickar ingredienserna kommer den här ytan visa matchande receptförslag.
            </p>
          ) : null}

          {suggestionMutation.isError ? (
            <p className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100">
              Kunde inte skapa receptförslag just nu.
            </p>
          ) : null}

          {suggestionMutation.isSuccess && suggestionMutation.data.suggestions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-base font-semibold">Generatorn är redo</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Backend svarar korrekt, men själva receptgeneratorn är inte inkopplad än.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </PageFrame>
  );
}
