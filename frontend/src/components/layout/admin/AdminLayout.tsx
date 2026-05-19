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
    <main className="page-shell px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
        <header className="content-card overflow-hidden">
          <div className="flex flex-col gap-5 border-b border-slate-200/80 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="break-anywhere text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800/70 sm:text-sm sm:tracking-[0.35em]">
                Administration
              </p>
              <h1 className="break-anywhere text-2xl font-semibold sm:text-3xl md:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 md:text-base">{description}</p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              <div className="break-anywhere w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 sm:w-auto sm:rounded-full">
                Inloggad som{" "}
                <span className="font-semibold text-slate-900">
                  {sessionQuery.data?.username ?? "admin"}
                </span>
              </div>
              <button
                className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white/70 disabled:opacity-60 sm:w-auto"
                type="button"
                onClick={() => void handleLogout()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Loggar ut..." : "Logga ut"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <nav className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 text-sm font-semibold sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              <Link
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white/80"
                to="/admin"
              >
                Översikt
              </Link>
              <Link
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white/80"
                to="/admin/recipes/new"
              >
                Nytt recept
              </Link>
              <Link
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white/80"
                to="/admin/gallery"
              >
                Galleri
              </Link>
              <Link
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white/80"
                to="/recipes"
              >
                Visa publika sidan
              </Link>
            </nav>

            {actions ? (
              <div className="flex w-full flex-wrap gap-3 sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
                {actions}
              </div>
            ) : null}
          </div>
        </header>

        <section>{children}</section>
      </div>
    </main>
  );
}
