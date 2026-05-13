import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";

export function NotFoundPage() {
  return (
    <PageFrame
      eyebrow="Sidan saknas"
      title="Vi hittade inte sidan du letade efter."
      description="Länken kan vara gammal, felstavad eller peka på en sida som inte finns längre. Du kan gå vidare till startsidan eller tillbaka till receptlistan."
      actions={
        <>
          <Link
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            to="/"
          >
            Gå till startsidan
          </Link>
          <Link
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
            to="/recipes"
          >
            Visa recept
          </Link>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-orange-100/70 p-5">
          <h2 className="text-lg font-semibold">Tillbaka till recepten</h2>
          <p className="mt-2 text-sm text-slate-700">
            Fortsätt till receptlistan om du vill hitta tillbaka till ett recept eller börja om från
            början.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-100 p-5">
          <h2 className="text-lg font-semibold">Kontrollera adressen</h2>
          <p className="mt-2 text-sm text-slate-700">
            Dubbelkolla URL:en om du förväntade dig ett specifikt recept eller en viss sida.
          </p>
        </div>
      </div>
    </PageFrame>
  );
}
