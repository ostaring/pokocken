import { Link } from "react-router-dom";
import { PublicRecipeSearch } from "@/components/layout/public/PublicRecipeSearch";

const publicNavLinks = [
  { label: "Vad kan jag laga?", to: "/suggest" },
  { label: "Galleri", to: "/gallery" },
];

type PublicHeaderProps = {
  showSearch?: boolean;
};

export function PublicHeader({ showSearch = true }: PublicHeaderProps) {
  const navLayoutClass = showSearch
    ? "lg:flex-row lg:items-center lg:justify-between"
    : "lg:flex-row lg:items-center lg:justify-between";

  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6">
      <nav
        className={`mx-auto flex w-full max-w-6xl flex-col gap-4 border-b border-slate-900/10 pb-4 ${navLayoutClass}`}
      >
        <div className="flex items-center justify-between gap-4 lg:justify-start lg:gap-10">
          <Link
            className="brand-type select-none text-2xl text-slate-950 outline-none transition hover:text-lime-950 focus-visible:text-lime-950"
            to="/"
          >
            Pokocken
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm font-semibold text-slate-700 lg:hidden">
            {publicNavLinks.map((link) => (
              <Link className="transition hover:text-lime-950" key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {showSearch ? <PublicRecipeSearch className="flex-1 lg:max-w-sm" /> : null}

        <div className="hidden items-center gap-9 text-base font-semibold leading-none text-slate-700 lg:flex">
          {publicNavLinks.map((link) => (
            <Link
              className="rounded-sm transition duration-200 hover:-translate-y-0.5 hover:text-lime-950 hover:drop-shadow-[0_8px_12px_rgba(15,23,42,0.18)] focus-visible:-translate-y-0.5 focus-visible:text-lime-950 focus-visible:outline-none focus-visible:drop-shadow-[0_8px_12px_rgba(15,23,42,0.18)]"
              key={link.to}
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
