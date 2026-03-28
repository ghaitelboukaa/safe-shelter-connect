import { Outlet } from "react-router-dom";
import { PublicNavbar } from "../shared/Navbar";

/** Layout for public / landing pages */
export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
