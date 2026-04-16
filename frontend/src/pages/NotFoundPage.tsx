import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";

export function NotFoundPage() {
  return (
    <PageFrame
      eyebrow="Sidan saknas"
      title="Vi hittade inte sidan du letade efter."
      description="Lanken kan vara gammal, felstavad eller peka pa en route som inte finns annu. Du kan ga vidare till startsidan, receptlistan eller adminflodet."
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-orange-100/70 p-5">
          <h2 className="text-lg font-semibold">Publika sidor</h2>
          <p className="mt-2 text-sm text-slate-700">
            Fortsatt till receptlistan om du vill hitta tillbaka till ett recept.
          </p>
        </div>
        <div className="rounded-3xl bg-emerald-100/70 p-5">
          <h2 className="text-lg font-semibold">Admin</h2>
          <p className="mt-2 text-sm text-slate-700">
            Om du var pa vag till admin kan du logga in igen och fortsatta darifran.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-100 p-5">
          <h2 className="text-lg font-semibold">Kontrollera adressen</h2>
          <p className="mt-2 text-sm text-slate-700">
            Dubbelkolla URL:en om du forvantade dig en specifik sida eller receptslug.
          </p>
        </div>
      </div>
    </PageFrame>
  );
}
