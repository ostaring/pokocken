import { Outlet } from "react-router-dom";
import { PublicFooter } from "@/components/layout/public/PublicFooter";
import { PublicHeader } from "@/components/layout/public/PublicHeader";

export function PublicLayout() {
  return (
    <div className="page-shell min-h-screen text-slate-900">
      <PublicHeader />
      <Outlet />
      <PublicFooter />
    </div>
  );
}
