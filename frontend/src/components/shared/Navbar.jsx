import { Link, useLocation } from "react-router-dom";
import { ShieldAlert, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-primary-800 rounded-xl group-hover:bg-primary-900 transition-colors">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-primary-800 tracking-tight">
              Safe-Shelter<span className="text-secondary">Connect</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-slate-700 font-medium hover:text-primary-800 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">
              Register
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 pb-4 pt-2 space-y-2 animate-fade-in">
          <Link to="/login" className="block py-2 px-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100" onClick={() => setOpen(false)}>
            Sign In
          </Link>
          <Link to="/register" className="block py-2 px-3 rounded-lg font-semibold text-white bg-primary-800 text-center" onClick={() => setOpen(false)}>
            Register Now
          </Link>
        </div>
      )}
    </nav>
  );
}

export function VictimNavbar() {
  const { logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/victim/portal" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
              <ShieldAlert className="h-5 w-5 text-primary-800" />
            </div>
            <span className="font-bold text-primary-800 text-sm tracking-tight italic">Safe-Shelter <span className="text-secondary">Connect</span></span>
          </Link>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-danger hover:bg-red-50 rounded-xl transition-all active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
