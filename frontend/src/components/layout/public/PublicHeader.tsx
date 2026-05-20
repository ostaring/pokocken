import { Link } from "react-router-dom";
import { PublicRecipeSearch } from "@/components/layout/public/PublicRecipeSearch";

const publicNavLinks = [
  { label: "Recept", to: "/recipes" },
  { label: "Galleri", to: "/gallery" },
  { label: "Vad kan jag laga?", to: "/suggest" },
];

type PublicHeaderProps = {
  showSearch?: boolean;
};

export function PublicHeader({ showSearch = true }: PublicHeaderProps) {
  const navLayoutClass = showSearch
    ? "lg:flex-row lg:items-center lg:justify-between"
    : "lg:flex-row lg:items-center lg:justify-start lg:gap-10";

  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6">
      <nav
        className={`mx-auto flex w-full max-w-6xl flex-col gap-4 border-b border-slate-900/10 pb-4 ${navLayoutClass}`}
      >
        <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <Link
            className="brand-type select-none text-2xl text-slate-950 outline-none transition hover:text-lime-950 focus-visible:text-lime-950"
            to="/"
          >
            Pokocken
          </Link>

          <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-slate-700 lg:hidden">
            {publicNavLinks.map((link) => (
              <Link className="transition hover:text-lime-950" key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {showSearch ? <PublicRecipeSearch className="flex-1 lg:max-w-sm" /> : null}

        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-700 lg:flex">
          {publicNavLinks.map((link) => (
            <Link className="transition hover:text-lime-950" key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
