import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";

export function HomePage() {
  return (
    <PageFrame
      eyebrow="Recipe App"
      title="A calm place for recipes, publishing, and admin work."
      description="We now have the frontend scaffold, route map, and provider setup in place. Next we can build the public recipe list and the admin flows on top of this shell."
      actions={
        <>
          <Link
            className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            to="/recipes"
          >
            Browse recipes
          </Link>
          <Link
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white/70"
            to="/admin"
          >
            Admin area
          </Link>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-orange-100/70 p-5">
          <h2 className="text-lg font-semibold">Public browsing</h2>
          <p className="mt-2 text-sm text-slate-700">
            Home, recipe list, and recipe detail routes are wired and ready for real data.
          </p>
        </div>
        <div className="rounded-3xl bg-emerald-100/70 p-5">
          <h2 className="text-lg font-semibold">Admin foundation</h2>
          <p className="mt-2 text-sm text-slate-700">
            Login, dashboard, and editor routes are mapped so we can add auth and CRUD next.
          </p>
        </div>
        <div className="rounded-3xl bg-amber-100/70 p-5">
          <h2 className="text-lg font-semibold">Typed app shell</h2>
          <p className="mt-2 text-sm text-slate-700">
            React Router, TanStack Query, TypeScript, and Tailwind are installed and connected.
          </p>
        </div>
      </div>
    </PageFrame>
  );
}
