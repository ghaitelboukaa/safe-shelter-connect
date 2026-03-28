import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { adminService } from "../../api/adminService";
import { Badge } from "../../components/ui/Badge";
import { SkeletonRow } from "../../components/ui/Skeleton";

export default function AdminReservationsPage() {
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminReservations", page],
    queryFn: () => adminService.getReservations(page).then((r) => r.data),
    keepPreviousData: true,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, action }) => adminService.updateReservation(id, action),
    onSuccess: (_, { action }) => {
      toast.success(`Reservation ${action === "Confirmed" ? "confirmed ✅" : "rejected ❌"}`);
      queryClient.invalidateQueries({ queryKey: ["adminReservations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setLoadingId(null);
    },
    onError: () => setLoadingId(null),
  });

  const handleAction = (id, action) => {
    setLoadingId(`${id}-${action}`);
    updateMutation.mutate({ id, action });
  };

  const reservations = data?.reservations ?? [];
  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-violet-100 rounded-xl">
          <Users className="h-5 w-5 text-violet-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Reservations</h1>
          <p className="text-slate-500 text-sm">
            Review and process pending shelter requests
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">CIN</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Zone</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Spot</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => {
                  const isConfirmLoading = loadingId === `${r.id_sinistre}-Confirmed`;
                  const isRejectLoading  = loadingId === `${r.id_sinistre}-Rejected`;

                  return (
                    <tr
                      key={r.id_sinistre}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {r.nom_complet}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                        {r.cin || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{r.zone || "—"}</td>
                      <td className="px-4 py-3 text-slate-700 font-mono">
                        {r.point_attribue || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={r.statut} />
                      </td>
                      <td className="px-4 py-3">
                        {r.statut === "Pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              id={`confirm-${r.id_sinistre}`}
                              onClick={() => handleAction(r.id_sinistre, "Confirmed")}
                              disabled={!!loadingId}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isConfirmLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Confirm
                            </button>

                            <button
                              id={`reject-${r.id_sinistre}`}
                              onClick={() => handleAction(r.id_sinistre, "Rejected")}
                              disabled={!!loadingId}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isRejectLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No action</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} · {data?.total ?? 0} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
