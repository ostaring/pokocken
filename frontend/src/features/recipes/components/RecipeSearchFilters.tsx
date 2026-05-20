import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getRecipeCategoryLabel,
  recipeCategories,
} from "@/features/recipes/utils/recipe-utils";
import type { RecipeCategory } from "@/types/recipe/recipe";

type RecipeSearchFiltersProps = {
  category: RecipeCategory | "All";
  className?: string;
  hasActiveFilters?: boolean;
  onCategoryChange: (category: RecipeCategory | "All") => void;
  onReset?: () => void;
  onSearchTermChange: (searchTerm: string) => void;
  searchTerm: string;
};

export function RecipeSearchFilters({
  category,
  className = "",
  hasActiveFilters = false,
  onCategoryChange,
  onReset,
  onSearchTermChange,
  searchTerm,
}: RecipeSearchFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (!isFilterOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFilterOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFilterOpen]);

  const activeFilterCount = category === "All" ? 0 : 1;
  const filterLabel = activeFilterCount > 0 ? `Filter (${activeFilterCount})` : "Filter";
  const filterSheet = isFilterOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-950/55 px-3 py-3 sm:items-center sm:justify-center sm:px-4 sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-label="Filter"
          onClick={() => setIsFilterOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-2xl sm:rounded-[1.75rem] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Filter</h2>
                <p className="mt-1 text-sm text-slate-600">Välj vad du är sugen på.</p>
              </div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={() => setIsFilterOpen(false)}
              >
                Stäng
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold text-slate-700">Kategori</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {recipeCategories.map((entry) => {
                  const isSelected = category === entry;

                  return (
                    <button
                      key={entry}
                      className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                      type="button"
                      onClick={() => onCategoryChange(entry)}
                    >
                      {getRecipeCategoryLabel(entry)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={onReset}
                disabled={!hasActiveFilters}
              >
                Rensa allt
              </button>
              <button
                className="flex-1 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-lime-950"
                type="button"
                onClick={() => setIsFilterOpen(false)}
              >
                Visa recept
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div className={className}>
        <div className="flex gap-2 rounded-full border border-white/70 bg-white/90 p-1 shadow-lg shadow-slate-900/15">
          <input
            className="min-h-12 min-w-0 flex-1 rounded-full bg-transparent px-4 text-slate-900 outline-none placeholder:text-slate-500"
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Sök på titel eller beskrivning"
            aria-label="Sök recept"
          />
          <button
            className="rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            type="button"
            onClick={() => setIsFilterOpen(true)}
          >
            {filterLabel}
          </button>
        </div>

        {hasActiveFilters ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {category !== "All" ? (
              <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-medium text-stone-950">
                {getRecipeCategoryLabel(category)}
              </span>
            ) : null}
            <button
              className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-800 transition hover:bg-white"
              type="button"
              onClick={onReset}
            >
              Rensa
            </button>
          </div>
        ) : null}
      </div>
      {filterSheet}
    </>
  );
}
