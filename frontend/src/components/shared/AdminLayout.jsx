import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../shared/AdminSidebar";

/** Desktop-optimized admin shell with collapsible sidebar */
export function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto lg:p-8 p-4 pt-20 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
