import type { PropsWithChildren, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminSessionQuery, useLogoutMutation } from "@/features/auth/hooks/auth-hooks";

type AdminLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
  actions?: ReactNode;
}>;

export function AdminLayout({ title, description, actions, children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const sessionQuery = useAdminSessionQuery();
  const logoutMutation = useLogoutMutation();

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate("/admin/login");
  }

  return (
    <main className="page-shell px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="content-card overflow-hidden">
          <div className="flex flex-col gap-6 border-b border-slate-200/80 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-800/70">
                Administration
              </p>
              <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
              <p className="max-w-2xl text-sm text-slate-600 md:text-base">{description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                Inloggad som{" "}
                <span className="font-semibold text-slate-900">
                  {sessionQuery.data?.username ?? "admin"}
                </span>
              </div>
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white/70 disabled:opacity-60"
                type="button"
                onClick={() => void handleLogout()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Loggar ut..." : "Logga ut"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white/80"
                to="/admin"
              >
                Översikt
              </Link>
              <Link
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white/80"
                to="/admin/recipes/new"
              >
                Nytt recept
              </Link>
              <Link
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white/80"
                to="/admin/gallery"
              >
                Galleri
              </Link>
              <Link
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white/80"
                to="/recipes"
              >
                Visa publika sidan
              </Link>
            </nav>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </header>

        <section>{children}</section>
      </div>
    </main>
  );
}
