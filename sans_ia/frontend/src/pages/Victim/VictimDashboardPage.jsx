import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Ticket, MapPin, CheckCircle2, Clock, XCircle,
  LayoutDashboard, User, ShieldCheck, AlertCircle,
  TrendingDown, Navigation, SearchX,
} from "lucide-react";
import { reservationService } from "../../api/zoneService";
import { Spinner } from "../../components/ui/Skeleton";
import { MapModal } from "../../components/shared/MapModal";
import { SearchInput } from "../../components/shared/SearchInput";

export default function VictimDashboardPage() {
  const queryClient = useQueryClient();
  const [mapZone, setMapZone] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["victimDashboard"],
    queryFn: () => reservationService.getDashboard().then((r) => r.data),
    refetchInterval: 60_000,
  });

  const cancelMutation = useMutation({
    mutationFn: () => reservationService.cancel(),
    onSuccess: () => {
      toast.info("Reservation cancelled.");
      queryClient.invalidateQueries({ queryKey: ["victimDashboard"] });
    },
  });

  const bookMutation = useMutation({
    mutationFn: (id_zone) => reservationService.create(id_zone),
    onSuccess: () => {
      toast.success("🏠 Spot requested! An admin will confirm shortly.");
      queryClient.invalidateQueries({ queryKey: ["victimDashboard"] });
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (isError) return <div className="text-center py-20 text-red-500">Failed to load dashboard.</div>;

  const { profile, reservation, available_zones } = data;
  const filteredZones = (available_zones || []).filter((z) =>
    z.nom_zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ── Welcome Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <LayoutDashboard className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Welcome back, {profile?.prenom || "Friend"}!
            </h1>
            <p className="text-slate-500 text-sm">Stay safe and monitor your assistance status</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Main Status Section ────────────────────────────────── */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">

          {/* Active Reservation Status */}
          <div className={`card overflow-hidden border-none shadow-xl ${reservation ? "bg-white" : "bg-blue-50/50 border-dashed border-2 border-blue-200"}`}>
            {reservation ? (
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-8 md:w-1/3 shrink-0 flex flex-col items-center justify-center text-center bg-slate-50/50">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 
                    ${reservation.statut_reservation === "Confirmed" ? "bg-emerald-100 shadow-sm" : "bg-amber-100 shadow-sm"}`}
                  >
                    {reservation.statut_reservation === "Confirmed"
                      ? <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                      : <Clock className="h-8 w-8 text-amber-600" />
                    }
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg tracking-tight">{reservation.statut_reservation}</h3>
                  <p className="text-slate-400 text-[10px] mt-1 uppercase font-black tracking-widest leading-none">Status</p>
                </div>
                <div className="p-8 flex-1 space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 leading-none">
                        <MapPin className="h-3 w-3" /> Zone
                      </p>
                      <p className="text-xl md:text-2xl font-black text-slate-900 leading-tight break-words">{reservation.nom_zone}</p>
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 md:justify-end leading-none">
                        <Ticket className="h-3 w-3" /> Spot
                      </p>
                      <p className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{reservation.emplacement || "TBD"}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-4 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-emerald-800 text-sm font-medium leading-relaxed">
                      {reservation.statut_reservation === "Confirmed"
                        ? "Your spot is secured. Show your digital ID upon arrival at the entrance."
                        : "We're currently processing your request. You'll receive a confirmation soon."
                      }
                    </p>
                  </div>

                  <button
                    id="cancel-reservation-btn"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-2 transition-colors pl-1"
                  >
                    {cancelMutation.isPending ? "Processing..." : <><XCircle className="h-4 w-4" /> Cancel my request</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center space-y-4">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">No active shelter assignment</h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Select a nearby zone below to request immediate shelter and assistance.
                </p>
              </div>
            )}
          </div>

          {/* Availability Grid */}
          {!reservation && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800">Shelter Availability</h2>
                <div className="w-full md:w-72">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search shelter zones..."
                  />
                </div>
              </div>

              {filteredZones.length === 0 && available_zones?.length > 0 ? (
                <div className="card p-12 text-center text-slate-400 border-dashed border-2">
                  <SearchX className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                  <p className="font-medium text-sm">No shelter zones match your search "{searchTerm}"</p>
                  <button onClick={() => setSearchTerm("")} className="text-primary-800 text-xs font-bold mt-2 hover:underline">Clear search</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredZones.map((z) => (
                    <div key={z.id_zone} className="card p-5 group hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-100">
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-primary-800 transition-colors uppercase tracking-wide text-sm">{z.nom_zone}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Available Near You</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setMapZone(z)}
                            className="p-3 bg-slate-50 hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all duration-300"
                            title="View on Map"
                          >
                            <MapPin className="h-5 w-5" />
                          </button>
                          <button
                            id={`book-zone-${z.id_zone}`}
                            onClick={() => bookMutation.mutate(z.id_zone)}
                            disabled={bookMutation.isPending}
                            className={`p-3 rounded-2xl transition-all duration-300 ${
                              z.capacite_restante <= 0 
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed hover:bg-slate-200" 
                                : "bg-slate-50 group-hover:bg-primary-800 text-slate-400 group-hover:text-white"
                            }`}
                            title="Request Spot"
                          >
                            <Navigation className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>{z.capacite_restante} spots remaining</span>
                          <span>{z.pct_full}% full</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${z.pct_full > 80 ? "bg-red-500" : z.pct_full > 50 ? "bg-amber-400" : "bg-emerald-500"}`}
                            style={{ width: `${z.pct_full}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Side Section (Utility Cards) ────────────────────────── */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">

          {/* Profile Quick Card */}
          <div className="card p-6 bg-white shadow-lg space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-primary-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <User className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">Your Profile</p>
                <h3 className="text-lg font-black text-slate-800">{profile?.nom} {profile?.prenom}</h3>
                <p className="text-xs text-slate-500 truncate max-w-[150px]">{profile?.email}</p>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-slate-700 font-medium text-sm">Need supplies?</span>
                    <p className="text-xs text-slate-400 mt-0.5">Ask your zone admin directly</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-1 rounded-lg">At Zone</span>
              </div>
            </div>
          </div>

          {/* Emergency Info Card */}
          <div className="rounded-3xl bg-gradient-to-br from-red-600 to-pink-700 p-8 text-white shadow-2xl shadow-red-100 space-y-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6" />
              <h3 className="font-extrabold text-lg">Emergency Help</h3>
            </div>
            <p className="text-red-100 text-sm leading-relaxed">
              If you are in immediate danger or need medical attention, please use the emergency button or contact local response units.
            </p>
            <div className="space-y-3 pt-2">
              <button className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95">
                Call Center 999
              </button>
            </div>
          </div>

        </div>
      </div>
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
