import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, CheckCircle2, Clock,
  MapPin, AlertTriangle, TrendingUp,
} from "lucide-react";
import { adminService } from "../../api/adminService";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useState } from "react";
import { SearchInput } from "../../components/shared/SearchInput";
import { SearchX } from "lucide-react";

const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ef4444"];

// ── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`card p-6 kpi-card glass animate-fade-in`}>
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
  const { isSuperAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => adminService.getDashboard().then((r) => r.data),
    refetchInterval: 60_000,
  });

  const hasCriticalStock = isSuperAdmin 
    ? data?.zones?.some((z) => z.critical_stock)
    : data?.critical_stock;

  // ── Data Preparation ─────────────────────────────────────────────
  const statusData = [
    { name: "Pending", value: data?.pending || 0 },
    { name: "Confirmed", value: data?.confirmed || 0 },
  ];

  const barData = (isSuperAdmin && data?.zones) 
    ? data.zones.map(z => ({
        name: z.nom_zone?.split(" ")[0] || "Zone", 
        full: Math.max(0, Math.min(100, z.pct_full || 0)),
        fullName: z.nom_zone
      })) 
    : [];

  const filteredZones = (data?.zones || []).filter(z => 
    z.nom_zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary-800 text-white rounded-2xl shadow-lg shadow-blue-100">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSuperAdmin ? "Global Operations" : `Zone: ${data?.nom_zone || "..."}`}
          </h1>
          <p className="text-slate-500 text-sm font-medium">Real-time logistics & monitoring</p>
        </div>
      </div>

      {/* ── Critical Stock Alert ──────────────────────────────────────── */}
      {hasCriticalStock && (
        <div className="flex items-start gap-4 bg-red-50 border border-red-100 rounded-3xl px-6 py-5 shadow-sm animate-pulse-subtle">
          <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">Critical Stock Alert</p>
            <p className="text-red-700 text-sm opacity-90">
              {isSuperAdmin 
                ? "One or more zones have resources below the 50 unit threshold. Urgent restock suggested."
                : "Your zone's resources are below the critical threshold (50 units). Please restock."
              }
            </p>
          </div>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : isError ? (
          <div className="sm:col-span-2 xl:col-span-4 text-center py-10 text-slate-500">Failed to load system data.</div>
        ) : (
          <>
            {isSuperAdmin && (
              <KpiCard icon={MapPin} label="Active Zones" value={data.total_zones} color="text-indigo-600" bg="bg-indigo-50" />
            )}
            {!isSuperAdmin && (
              <KpiCard icon={TrendingUp} label="Capacity Usage" value={`${data.pct_full}%`} color="text-indigo-600" bg="bg-indigo-50" />
            )}
            <KpiCard icon={Users} label="Total Intake" value={data.total_reservations} color="text-violet-600" bg="bg-violet-50" />
            <KpiCard icon={Clock} label="Waitlist" value={data.pending} color="text-amber-600" bg="bg-amber-50" />
            <KpiCard icon={CheckCircle2} label="Secured Spots" value={data.confirmed} color="text-emerald-600" bg="bg-emerald-50" />
          </>
        )}
      </div>

      {/* ── Visual Insights (New Section) ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Status Distribution Donut */}
        <div className="lg:col-span-5 xl:col-span-4 card p-6 flex flex-col items-center">
           <h3 className="font-bold text-slate-800 self-start mb-6">Status Breakdown</h3>
           {(data?.pending ?? 0) + (data?.confirmed ?? 0) === 0 ? (
             <div className="flex flex-col items-center justify-center h-[250px] text-slate-400 gap-3">
               <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center">
                 <CheckCircle2 className="h-8 w-8 text-slate-200" />
               </div>
               <p className="text-sm font-medium">No reservations yet</p>
             </div>
           ) : (
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
           </div>
           )}
        </div>

        {/* Global Zone Usage Bar (For Super Admin) */}
        {isSuperAdmin ? (
          <div className="lg:col-span-7 xl:col-span-8 card p-6">
             <h3 className="font-bold text-slate-800 mb-6">Zone Comparison (%)</h3>
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="full" radius={[6, 6, 0, 0]} barSize={40}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.full > 80 ? '#ef4444' : entry.full > 50 ? '#fbbf24' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        ) : (
          <div className="lg:col-span-7 xl:col-span-8 card p-8 bg-gradient-to-br from-primary-800 to-indigo-900 text-white flex flex-col justify-center">
             <h3 className="font-bold mb-4 opacity-80 uppercase tracking-widest text-xs">Real-time Occupancy</h3>
             <div className="flex items-baseline gap-3 mb-6">
               <span className="text-7xl font-black">{data?.pct_full}%</span>
               <span className="text-blue-300 font-bold">FULL</span>
             </div>
             <p className="text-blue-100 text-sm leading-relaxed mb-8 max-w-sm">
                Management of <strong>{data?.nom_zone}</strong>. Currently housing {data?.confirmed} confirmed residents with {data?.pending} on waitlist.
             </p>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase opacity-70">
                   <span>Occupied</span>
                   <span>{data?.pct_full}%</span>
                </div>
                <ProgressBar value={data?.pct_full} className="bg-white/10 h-3" />
             </div>
          </div>
        )}
      </div>

      {/* ── List View (Only for Super Admin) ────────────────────────── */}
      {isSuperAdmin && (
        <div className="card overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/10 gap-4">
            <h2 className="font-bold text-slate-800 shrink-0">Zone Registry</h2>
            <div className="flex-1 max-w-sm">
               <SearchInput 
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search zones..."
                className="h-9"
               />
            </div>
            <div className="flex gap-4 text-[10px] font-black uppercase text-slate-400 shrink-0">
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Optimal</span>
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> High</span>
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Full</span>
            </div>
          </div>
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            {filteredZones.length === 0 && data?.zones?.length > 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                <SearchX className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                <p className="text-sm font-medium">No zones match your search "{searchTerm}"</p>
                <button onClick={() => setSearchTerm("")} className="text-primary-800 text-xs font-bold mt-2">Clear search</button>
              </div>
            ) : (
              filteredZones.map((zone) => (
                <div key={zone.nom_zone} className="px-6 py-5 group hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800 text-sm">{zone.nom_zone}</span>
                      {zone.critical_stock && <span className="bg-red-100 text-red-600 text-[9px] px-2 py-0.5 rounded-lg font-black tracking-widest uppercase">Low Stock</span>}
                    </div>
                    <span className="text-sm font-black text-slate-900">{Math.max(0, Math.min(100, zone.pct_full))}%</span>
                  </div>
                  <ProgressBar value={Math.max(0, Math.min(100, zone.pct_full))} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
