import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";

export function HomePage() {
  return (
    <PageFrame
      eyebrow="Receptappen"
      title="En lugn plats för recept, publicering och administrationsarbete."
      description="Vi har nu frontendens grundstruktur, routes och providers på plats. Nästa steg är att bygga den publika receptlistan och adminflödena vidare ovanpå detta skal."
      actions={
        <>
          <Link
            className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            to="/recipes"
          >
            Utforska recept
          </Link>
          <Link
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white/70"
            to="/admin"
          >
            Adminområde
          </Link>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-orange-100/70 p-5">
          <h2 className="text-lg font-semibold">Publik del</h2>
          <p className="mt-2 text-sm text-slate-700">
            Startsida, receptlista och receptdetaljer är kopplade och redo för riktig data.
          </p>
        </div>
        <div className="rounded-3xl bg-emerald-100/70 p-5">
          <h2 className="text-lg font-semibold">Admingrund</h2>
          <p className="mt-2 text-sm text-slate-700">
            Inloggning, översikt och editor är uppsatta så att vi kan bygga auth och CRUD vidare.
          </p>
        </div>
        <div className="rounded-3xl bg-amber-100/70 p-5">
          <h2 className="text-lg font-semibold">Typat appskelett</h2>
          <p className="mt-2 text-sm text-slate-700">
            React Router, TanStack Query, TypeScript och Tailwind är installerade och ihopkopplade.
          </p>
        </div>
      </div>
    </PageFrame>
  );
}
