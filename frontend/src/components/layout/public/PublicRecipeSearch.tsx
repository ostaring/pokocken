import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

type PublicRecipeSearchProps = {
  className?: string;
  inputId?: string;
};

export function PublicRecipeSearch({
  className = "",
  inputId = "public-recipe-search",
}: PublicRecipeSearchProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSearch = searchTerm.trim();
    navigate(
      normalizedSearch
        ? `/?search=${encodeURIComponent(normalizedSearch)}`
        : "/",
    );
  }

  return (
    <form
      className={`flex min-w-0 gap-2 rounded-full border border-slate-300/80 bg-stone-50/80 p-1 shadow-sm ${className}`}
      role="search"
      onSubmit={handleSearchSubmit}
    >
      <label className="sr-only" htmlFor={inputId}>
        Sök recept
      </label>
      <input
        id={inputId}
        className="min-h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-500"
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Sök recept"
      />
      <button
        className="rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-lime-950"
        type="submit"
      >
        Sök
      </button>
    </form>
  );
}
