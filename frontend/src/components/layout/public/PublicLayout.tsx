import { Outlet, useLocation } from "react-router-dom";
import { PublicFooter } from "@/components/layout/public/PublicFooter";
import { PublicHeader } from "@/components/layout/public/PublicHeader";

export function PublicLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="page-shell min-h-screen text-slate-900">
      <PublicHeader showSearch={!isHomePage} />
      <Outlet />
      <PublicFooter />
    </div>
  );
}
