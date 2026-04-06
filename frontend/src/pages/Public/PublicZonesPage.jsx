import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Navigation, Users, AlertTriangle, ArrowRight,
  LogIn, UserPlus, X, ShieldCheck, HeartHandshake, Lock, Map, SearchX,
} from "lucide-react";
import { zoneService } from "../../api/zoneService";
import { MapModal } from "../../components/shared/MapModal";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../../components/ui/Skeleton";
import { SearchInput } from "../../components/shared/SearchInput";

// ── Auth Prompt Modal ──────────────────────────────────────────────────────────
function AuthPromptModal({ isOpen, onClose, zoneName }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top gradient banner */}
          <div className="bg-gradient-to-br from-primary-800 to-primary-900 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-8 w-40 h-40 bg-emerald-500/10 rounded-full" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-extrabold mb-1">Account Required</h2>
              <p className="text-blue-200 text-sm">
                {zoneName
                  ? `To request a spot in "${zoneName}", you need an account.`
                  : "You need an account to request a shelter spot."}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-emerald-800 text-sm font-medium leading-relaxed">
                Creating an account is free and only takes a minute. Your shelter request will be submitted immediately after login.
              </p>
            </div>

            {/* Actions */}
            <Link
              to="/register"
              id="auth-prompt-register-btn"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 bg-primary-800 text-white font-bold rounded-2xl hover:bg-primary-900 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-primary-800/20"
            >
              <UserPlus className="h-5 w-5" />
              Create Free Account
            </Link>

            <Link
              to="/login"
              id="auth-prompt-login-btn"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all duration-200"
            >
              <LogIn className="h-5 w-5" />
              I Already Have an Account
            </Link>

            <button
              onClick={onClose}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
            >
              Maybe later
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Zone Card ──────────────────────────────────────────────────────────────────
function ZoneCard({ zone, onRequestSpot, onViewMap }) {
  const pct =
    zone.capacite_max > 0
      ? Math.round(
          ((zone.capacite_max - zone.capacite_restante) / zone.capacite_max) * 100
        )
      : 0;
  const isFull = zone.capacite_restante <= 0;

  const barColor =
    pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div
      className={`card p-5 transition-all duration-300 group ${
        isFull ? "opacity-60" : "hover:shadow-xl hover:-translate-y-1 hover:border-blue-100"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary-50 rounded-lg shrink-0">
              <MapPin className="h-4 w-4 text-primary-800" />
            </div>
            <p className="font-bold text-slate-900 text-base group-hover:text-primary-800 transition-colors truncate">
              {zone.nom_zone}
            </p>
          </div>
          {zone.adress_gps && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-9">
              <Navigation className="h-3 w-3 shrink-0" />
              <span className="truncate">{zone.adress_gps}</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        <span
          className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
            isFull
              ? "bg-red-50 text-red-600 border border-red-100"
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          }`}
        >
          {isFull ? "Full" : "Available"}
        </span>
      </div>

      {/* Capacity bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
          <span>{zone.capacite_restante} spots left</span>
          <span>{pct}% full</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Map button */}
        {zone.adress_gps && (
          <button
            id={`public-map-zone-${zone.id_zone}`}
            onClick={() => onViewMap(zone)}
            title="View on Map"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all duration-200 shrink-0"
          >
            <Map className="h-4 w-4" />
          </button>
        )}

        {/* Request button */}
        <button
          id={`public-request-zone-${zone.id_zone}`}
          onClick={() => !isFull && onRequestSpot(zone)}
          disabled={isFull}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            isFull
              ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100"
              : "bg-primary-800 text-white hover:bg-primary-900 active:scale-95 shadow-sm"
          }`}
        >
          {isFull ? (
            <>
              <Users className="h-4 w-4" />
              Zone Full
            </>
          ) : (
            <>
              <HeartHandshake className="h-4 w-4" />
              Request a Spot
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Public Zones Page ─────────────────────────────────────────────────────
export default function PublicZonesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mapZone, setMapZone] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicZones"],
    queryFn: () => zoneService.getAll().then((r) => r.data),
    staleTime: 60_000,
  });

  const zones = data || [];
  const availableCount = zones.filter((z) => z.capacite_restante > 0).length;

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const filteredZones = zones.filter((z) =>
    z.nom_zone.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Sort: available first, full last
  const sortedZones = [...filteredZones].sort((a, b) => {
    const aFull = a.capacite_restante <= 0;
    const bFull = b.capacite_restante <= 0;
    return aFull === bFull ? 0 : aFull ? 1 : -1;
  });

  function handleRequestSpot(zone) {
    if (isAuthenticated) {
      // Already logged in → go straight to their portal
      navigate("/victim/portal");
    } else {
      // Show auth prompt
      setSelectedZone(zone);
      setModalOpen(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="hero-gradient py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ArrowRight className="h-3 w-3" />
            <span className="text-white font-medium">Shelter Zones</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Available Shelter Zones
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl">
            Browse all active shelter zones and their current availability. Find a safe spot near you.
          </p>
          {!isLoading && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {availableCount} zone{availableCount !== 1 ? "s" : ""} with available spots
            </div>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-4 py-20 text-slate-500">
            <AlertTriangle className="h-12 w-12 text-amber-400" />
            <p className="font-semibold text-lg">Could not load shelter zones.</p>
            <p className="text-sm">Please check your connection and try again.</p>
          </div>
        )}

        {!isLoading && !isError && zones.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-slate-500">
            <Users className="h-12 w-12 text-slate-300" />
            <p className="font-semibold text-lg">No shelter zones available right now.</p>
            <p className="text-sm">Please contact the emergency response team or check back later.</p>
          </div>
        )}

        {!isLoading && !isError && zones.length > 0 && (
          <>
            {/* Search bar */}
            <div className="mb-8 max-w-sm">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search zones by name..."
              />
            </div>

            {sortedZones.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-slate-500">
                <SearchX className="h-12 w-12 text-slate-300" />
                <p className="font-semibold text-lg">No zones match "{searchTerm}"</p>
                <button onClick={() => setSearchTerm("")} className="text-primary-800 text-sm font-bold hover:underline">Clear search</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {sortedZones.map((zone) => (
                  <ZoneCard
                    key={zone.id_zone}
                    zone={zone}
                    onRequestSpot={handleRequestSpot}
                    onViewMap={(z) => setMapZone(z)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Bottom CTA for unauthenticated users ── */}
        {!isAuthenticated && !isLoading && zones.length > 0 && (
          <div className="mt-16 rounded-3xl bg-gradient-to-br from-primary-800 to-primary-900 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-500/10 rounded-full" />
            <div className="relative z-10">
              <HeartHandshake className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold mb-3">Ready to find shelter?</h2>
              <p className="text-blue-200 mb-8 max-w-lg mx-auto">
                Create a free account to request a spot in any of the available zones. The process takes less than a minute.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  id="zones-cta-register"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white text-primary-800 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:-translate-y-0.5"
                >
                  <UserPlus className="h-5 w-5" />
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  id="zones-cta-login"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-transparent border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-200"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        zoneName={selectedZone?.nom_zone}
      />

      {/* Map Modal */}
      <MapModal
        isOpen={!!mapZone}
        onClose={() => setMapZone(null)}
        address={mapZone?.adress_gps}
        zoneName={mapZone?.nom_zone}
      />
    </div>
  );
}
