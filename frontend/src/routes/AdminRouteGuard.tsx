import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminSessionQuery } from "../features/auth/auth-hooks";

type AdminRouteGuardProps = {
  children: ReactNode;
};

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const location = useLocation();
  const sessionQuery = useAdminSessionQuery();

  if (sessionQuery.isLoading) {
    return (
      <main className="page-shell px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] bg-white/80 p-8 text-sm text-slate-700 shadow-sm">
          Loading admin session...
        </div>
      </main>
    );
  }

  if (!sessionQuery.data) {
    const redirectTo = encodeURIComponent(location.pathname);
    return <Navigate to={`/admin/login?redirect=${redirectTo}`} replace />;
  }

  return <>{children}</>;
}
