import { Outlet } from "react-router-dom";
import { VictimNavbar } from "../shared/Navbar";

/** Layout for the mobile-first victim portal */
export function VictimLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <VictimNavbar />
      <main className="pt-20 max-w-6xl mx-auto px-4 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
