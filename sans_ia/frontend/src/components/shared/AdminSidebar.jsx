import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Package,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

export function AdminSidebar() {
  const { logout, isSuperAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: "/admin/dashboard",     icon: LayoutDashboard, label: "Dashboard"     },
    { to: "/admin/reservations",  icon: Users,           label: "Reservations"  },
    { to: "/admin/logistics",     icon: Package,         label: "Logistics"     },
    { to: "/admin/teams",         icon: Users,           label: "Teams"         },
    { to: "/admin/victims",       icon: Users,           label: "Victims"       },
  ];

  if (isSuperAdmin) {
    navItems.push({ to: "/admin/zones", icon: MapPin, label: "Zones" });
    navItems.push({ to: "/admin/users", icon: ShieldAlert, label: "Manage Admins" });
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-white/10", collapsed && "justify-center px-2")}>
        <div className="p-2 bg-white/10 rounded-xl shrink-0">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-white text-sm leading-tight">Safe-Shelter</p>
            <p className="text-emerald-400 text-xs font-medium">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-blue-200 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-2"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle & logout */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-blue-300 hover:bg-white/10 transition-all duration-200 justify-center"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-gradient-to-b from-primary-800 to-primary-900 transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-primary-800 flex items-center px-4 gap-3 shadow-sm">
        <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <Menu className="h-5 w-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-white text-sm tracking-tight text-nowrap">Admin Portal</span>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="relative w-64 bg-gradient-to-b from-primary-800 to-primary-900 h-full animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
