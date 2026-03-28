import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Ticket, MapPin, Home, CheckCircle2, Clock, XCircle,
  Loader2, AlertTriangle, Users, Navigation,
} from "lucide-react";
import { reservationService } from "../../api/zoneService";
import { zoneService } from "../../api/zoneService";
import { Spinner } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";

// ── Shelter Ticket Card ────────────────────────────────────────────────────
function ShelterTicket({ reservation, onCancel, isCancelling }) {
  const { statut_reservation, zone, emplacement } = reservation;

  const statusIcon = {
    Confirmed: <CheckCircle2 className="h-5 w-5 text-secondary" />,
    Pending:   <Clock className="h-5 w-5 text-warning" />,
    Rejected:  <XCircle className="h-5 w-5 text-danger" />,
  }[statut_reservation];

  return (
    <div className="animate-fade-in space-y-6 pt-6">
      {/* Header */}
      <div className="text-center">
        <Ticket className="h-10 w-10 text-primary-800 mx-auto mb-2" />
        <h2 className="text-xl font-extrabold text-slate-900">Your Shelter Ticket</h2>
        <p className="text-slate-500 text-sm">Keep this information safe</p>
      </div>

      {/* Ticket card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-800 to-primary-900 text-white p-6 shadow-2xl">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full" />

        {/* Status pill */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="text-xs font-medium text-blue-200 uppercase tracking-widest">
            Safe-Shelter Connect
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            ${statut_reservation === "Confirmed" ? "bg-emerald-500/30 text-emerald-300" : "bg-amber-500/30 text-amber-300"}`}
          >
            {statusIcon}
            {statut_reservation}
          </div>
        </div>

        {/* Zone & Spot */}
        <div className="space-y-4 relative z-10">
          <div>
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wide mb-1">Zone</p>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-400 shrink-0" />
              <p className="text-xl font-bold">{zone || "—"}</p>
            </div>
          </div>

          <div>
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wide mb-1">Assigned Spot</p>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-emerald-400 shrink-0" />
              <p className="text-xl font-bold">{emplacement || "Pending assignment"}</p>
            </div>
          </div>
        </div>

        {/* Dashed separator */}
        <div className="border-t border-dashed border-white/20 my-5 relative z-10" />

        {statut_reservation === "Pending" && (
          <p className="text-blue-200 text-xs text-center relative z-10">
            ⏳ Your request is under review by the admin team.
          </p>
        )}
        {statut_reservation === "Confirmed" && (
          <p className="text-emerald-300 text-xs text-center font-medium relative z-10">
            ✅ Your shelter spot is confirmed. Please proceed to the zone.
          </p>
        )}
      </div>

      {/* Cancel button */}
      {["Pending", "Confirmed"].includes(statut_reservation) && (
        <button
          id="cancel-reservation-btn"
          onClick={onCancel}
          disabled={isCancelling}
          className="btn-danger w-full"
        >
          {isCancelling ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Cancelling…</>
          ) : (
            <><XCircle className="h-4 w-4" /> Cancel Reservation</>
          )}
        </button>
      )}
    </div>
  );
}

// ── Zone Grid (no reservation yet) ────────────────────────────────────────
function ZoneGrid({ onBook }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneService.getAll().then((r) => r.data),
  });

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
      <AlertTriangle className="h-10 w-10 text-amber-400" />
      <p className="font-medium">Could not load zones. Please try again.</p>
    </div>
  );

  const zones = data || [];
  const availableZones = zones.filter((z) => z.capacite_restante > 0);

  return (
    <div className="animate-fade-in space-y-6 pt-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Available Shelter Zones</h2>
        <p className="text-slate-500 text-sm mt-1">
          {availableZones.length} zone{availableZones.length !== 1 ? "s" : ""} with available spots
        </p>
      </div>

      {zones.length === 0 && (
        <div className="card p-8 text-center text-slate-500">
          <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No shelter zones available right now.</p>
          <p className="text-sm mt-1">Please check back later or contact the admin.</p>
        </div>
      )}

      <div className="space-y-3">
        {zones.map((zone) => {
          const pct = zone.capacite_max > 0
            ? Math.round(((zone.capacite_max - zone.capacite_restante) / zone.capacite_max) * 100)
            : 0;
          const isFull = zone.capacite_restante <= 0;

          return (
            <div key={zone.id_zone} className={`card p-4 transition-all duration-200 ${isFull ? "opacity-60" : "hover:shadow-md"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary-800 shrink-0" />
                    <p className="font-bold text-slate-900 truncate">{zone.nom_zone}</p>
                  </div>
                  {zone.adress_gps && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 ml-6">
                      <Navigation className="h-3 w-3" />
                      {zone.adress_gps}
                    </div>
                  )}
                  {/* Capacity bar */}
                  <div className="ml-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{zone.capacite_restante} spots left</span>
                      <span>{pct}% full</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  id={`request-zone-${zone.id_zone}`}
                  onClick={() => !isFull && onBook(zone.id_zone)}
                  disabled={isFull}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isFull
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-primary-800 text-white hover:bg-primary-900 active:scale-95"
                  }`}
                >
                  {isFull ? "Full" : "Request Spot"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Victim Portal Page ────────────────────────────────────────────────
export default function VictimPortalPage() {
  const queryClient = useQueryClient();

  // Fetch my reservation
  const { data: reservationData, isLoading } = useQuery({
    queryKey: ["myReservation"],
    queryFn: () => reservationService.getMine().then((r) => r.data),
    retry: false,
  });

  // Create reservation
  const bookMutation = useMutation({
    mutationFn: (id_zone) => reservationService.create(id_zone),
    onSuccess: () => {
      toast.success("🏠 Spot requested! An admin will confirm shortly.");
      queryClient.invalidateQueries({ queryKey: ["myReservation"] });
    },
  });

  // Cancel reservation
  const cancelMutation = useMutation({
    mutationFn: () => reservationService.cancel(),
    onSuccess: () => {
      toast.info("Reservation cancelled.");
      queryClient.invalidateQueries({ queryKey: ["myReservation"] });
    },
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  );

  const reservation = reservationData?.reservation;
  const hasActiveReservation = reservation && ["Pending", "Confirmed"].includes(reservation.statut_reservation);

  return (
    <>
      {hasActiveReservation ? (
        <ShelterTicket
          reservation={reservation}
          onCancel={() => cancelMutation.mutate()}
          isCancelling={cancelMutation.isPending}
        />
      ) : (
        <ZoneGrid onBook={(id_zone) => bookMutation.mutate(id_zone)} />
      )}
    </>
  );
}
