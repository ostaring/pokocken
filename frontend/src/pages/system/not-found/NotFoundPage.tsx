import { PageFrame } from "@/components/layout/public/PageFrame";

export function NotFoundPage() {
  return (
    <PageFrame
      eyebrow="Sidan saknas"
      title="Vi hittade inte sidan du letade efter."
      description="Länken kan vara gammal, felstavad eller peka på en sida som inte finns längre."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-stone-200/70 p-5">
          <h2 className="text-lg font-semibold">Sidan finns inte</h2>
          <p className="mt-2 text-sm text-slate-700">
            Använd navigationen högst upp om du vill gå vidare till recept, galleri eller startsidan.
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
