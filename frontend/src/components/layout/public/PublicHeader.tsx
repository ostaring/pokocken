import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function PublicHeader() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSearch = searchTerm.trim();
    navigate(
      normalizedSearch
        ? `/recipes?search=${encodeURIComponent(normalizedSearch)}`
        : "/recipes",
    );
  }

  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-4 border-b border-slate-900/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link
            className="brand-type select-none text-2xl text-slate-950 outline-none transition hover:text-lime-950 focus-visible:text-lime-950"
            to="/"
          >
            Pokocken
          </Link>

          <div className="flex items-center gap-5 text-sm font-semibold text-slate-700 sm:hidden">
            <Link className="transition hover:text-lime-950" to="/recipes">
              Recept
            </Link>
            <Link className="transition hover:text-lime-950" to="/gallery">
              Galleri
            </Link>
          </div>
        </div>

        <form
          className="flex min-w-0 flex-1 gap-2 rounded-full border border-slate-300/80 bg-stone-50/80 p-1 shadow-sm lg:max-w-sm"
          role="search"
          onSubmit={handleSearchSubmit}
        >
          <label className="sr-only" htmlFor="public-recipe-search">
            Sök recept
          </label>
          <input
            id="public-recipe-search"
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

        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-700 sm:flex">
          <Link className="transition hover:text-lime-950" to="/recipes">
            Recept
          </Link>
          <Link className="transition hover:text-lime-950" to="/gallery">
            Galleri
          </Link>
          <Link className="transition hover:text-lime-950" to="/suggest">
            Vad kan jag laga?
          </Link>
        </div>
      </nav>
    </header>
  );
}
