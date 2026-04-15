import type { ReactNode } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAdminSessionQuery } from "../features/auth/auth-hooks";

type AdminLoginRouteProps = {
  children: ReactNode;
};

export function AdminLoginRoute({ children }: AdminLoginRouteProps) {
  const sessionQuery = useAdminSessionQuery();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";

  if (sessionQuery.isLoading) {
    return (
      <main className="page-shell px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] bg-white/80 p-8 text-sm text-slate-700 shadow-sm">
          Loading admin session...
        </div>
      </main>
    );
  }

  if (sessionQuery.data) {
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
