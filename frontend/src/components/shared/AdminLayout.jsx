import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../shared/AdminSidebar";

/** Desktop-optimized admin shell with collapsible sidebar and global search top bar */
export function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - No longer shared search */}
        <header className="hidden lg:flex h-20 items-center justify-end px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 z-20">
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-900 leading-none">Administrator</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Status: Online</span>
            </div>
          </div>
        </header>

        {/* Main Scrolling Area */}
        <main className="flex-1 overflow-y-auto lg:p-8 p-4 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
