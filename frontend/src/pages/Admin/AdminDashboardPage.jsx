import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, CheckCircle2, Clock,
  MapPin, AlertTriangle, TrendingUp,
} from "lucide-react";
import { adminService } from "../../api/adminService";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { ProgressBar } from "../../components/ui/ProgressBar";

// ── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`card p-6 kpi-card glass`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{value ?? "—"}</p>
        </div>
        <div className={`p-3 rounded-2xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => adminService.getDashboard().then((r) => r.data),
    refetchInterval: 60_000, // auto-refresh every 60 s
  });

  const hasCriticalStock = data?.zones?.some((z) => z.critical_stock);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-xl">
          <LayoutDashboard className="h-5 w-5 text-primary-800" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time overview of operations</p>
        </div>
      </div>

      {/* ── Critical Stock Alert ──────────────────────────────────────── */}
      {hasCriticalStock && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Critical Stock Alert</p>
            <p className="text-red-700 text-sm mt-0.5">
              One or more zones have resource stocks below the critical threshold (50 units).
              Please dispatch supplies immediately.
            </p>
          </div>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : isError ? (
          <div className="sm:col-span-2 xl:col-span-4 text-center py-10 text-slate-500">
            Failed to load dashboard data.
          </div>
        ) : (
          <>
            <KpiCard
              icon={MapPin}
              label="Total Zones"
              value={data.total_zones}
              color="text-primary-800"
              bg="bg-blue-100"
            />
            <KpiCard
              icon={Users}
              label="Total Reservations"
              value={data.total_reservations}
              color="text-violet-700"
              bg="bg-violet-100"
            />
            <KpiCard
              icon={Clock}
              label="Pending"
              value={data.pending}
              color="text-amber-600"
              bg="bg-amber-100"
            />
            <KpiCard
              icon={CheckCircle2}
              label="Confirmed"
              value={data.confirmed}
              color="text-secondary"
              bg="bg-emerald-100"
            />
          </>
        )}
      </div>

      {/* ── Zone Capacity List ────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-400" />
            <h2 className="font-bold text-slate-900">Zone Capacity Overview</h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> &lt; 50%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 50–80%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &gt; 80%
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 space-y-2">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data?.zones?.map((zone) => (
              <div key={zone.nom_zone} className="px-6 py-4 group hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-slate-800 text-sm">{zone.nom_zone}</span>
                    {zone.critical_stock && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${
                    zone.pct_full > 80 ? "text-red-600" : zone.pct_full > 50 ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {zone.pct_full}%
                  </span>
                </div>
                <ProgressBar value={zone.pct_full} />
              </div>
            ))}

            {!data?.zones?.length && (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">
                No zones found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
