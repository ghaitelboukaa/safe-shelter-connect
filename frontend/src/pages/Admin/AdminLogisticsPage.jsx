import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Package, Send, Loader2, ChevronDown, AlertTriangle,
  BarChart3, RefreshCw,
} from "lucide-react";
import { adminService } from "../../api/adminService";
import { zoneService, resourceService } from "../../api/zoneService";

// ── Stock Panel ─────────────────────────────────────────────────────────────
function StockPanel({ zoneId }) {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["zoneStocks", zoneId],
    queryFn: () => adminService.getZoneStocks(zoneId).then((r) => r.data),
    enabled: !!zoneId,
  });

  if (!zoneId) return (
    <div className="card p-8 text-center text-slate-400">
      <BarChart3 className="h-10 w-10 mx-auto mb-3 text-slate-200" />
      <p className="text-sm">Select a zone to view its stock levels.</p>
    </div>
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900">Current Stock Levels</h3>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          aria-label="Refresh stocks"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-3 flex justify-between">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : data?.stocks?.length === 0 ? (
        <div className="px-5 py-10 text-center text-slate-400 text-sm">
          No stock recorded for this zone.
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {data?.stocks?.map((s) => (
            <div key={s.id_ressource} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-800 text-sm">{s.type_ressource}</p>
                <p className="text-xs text-slate-400">{s.unite_mesure}</p>
              </div>
              <div className={`text-sm font-bold ${s.quantite_disponible < 50 ? "text-danger" : "text-emerald-600"}`}>
                {s.quantite_disponible < 50 && (
                  <AlertTriangle className="h-3.5 w-3.5 inline mr-1 text-danger" />
                )}
                {s.quantite_disponible} {s.unite_mesure}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminLogisticsPage() {
  const [form, setForm] = useState({
    id_zone: "",
    id_ressource: "",
    id_sinistre: "",
    quantite_donnee: "",
    unite_mesure: "Unit",
  });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Data fetches
  const { data: zonesData } = useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneService.getAll().then((r) => r.data),
  });

  const { data: resourcesData } = useQuery({
    queryKey: ["resources"],
    queryFn: () => resourceService.getAll().then((r) => r.data),
  });

  const zones = Array.isArray(zonesData) ? zonesData : [];
  const resources = resourcesData?.resources ?? [];

  // Distribution mutation
  const distributeMutation = useMutation({
    mutationFn: (payload) => adminService.recordDistribution(payload),
    onSuccess: (res) => {
      toast.success(`Distribution recorded! Stock remaining: ${res.data.stock_remaining}`);
      setForm((p) => ({ ...p, quantite_donnee: "", id_sinistre: "" }));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    distributeMutation.mutate({
      ...form,
      id_zone: parseInt(form.id_zone),
      id_ressource: parseInt(form.id_ressource),
      id_sinistre: form.id_sinistre ? parseInt(form.id_sinistre) : null,
      quantite_donnee: parseFloat(form.quantite_donnee),
    });
  };

  const selectClass = "input-field appearance-none cursor-pointer pr-10";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-xl">
          <Package className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Logistics & Distribution</h1>
          <p className="text-slate-500 text-sm">Record resource distributions to zones</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Distribution Form ─────────────────────────────────── */}
        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Send className="h-4 w-4 text-primary-800" />
            Record Distribution
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Zone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Zone</label>
              <div className="relative">
                <select
                  name="id_zone"
                  value={form.id_zone}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">Select a zone…</option>
                  {zones.map((z) => (
                    <option key={z.id_zone} value={z.id_zone}>{z.nom_zone}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Resource */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Resource</label>
              <div className="relative">
                <select
                  name="id_ressource"
                  value={form.id_ressource}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">Select a resource…</option>
                  {resources.map((r) => (
                    <option key={r.id_ressource} value={r.id_ressource}>
                      {r.type_ressource} ({r.unite_mesure})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Quantity + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity</label>
                <input
                  name="quantite_donnee"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.quantite_donnee}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 50"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                <div className="relative">
                  <select
                    name="unite_mesure"
                    value={form.unite_mesure}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option>Unit</option>
                    <option>kg</option>
                    <option>Litre</option>
                    <option>Box</option>
                    <option>Piece</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Sinistre ID (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Beneficiary ID <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                name="id_sinistre"
                type="number"
                min="1"
                value={form.id_sinistre}
                onChange={handleChange}
                placeholder="Sinistré ID"
                className="input-field"
              />
            </div>

            <button
              id="distribute-submit"
              type="submit"
              disabled={distributeMutation.isPending}
              className="btn-primary w-full"
            >
              {distributeMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Recording…</>
              ) : (
                <><Send className="h-4 w-4" /> Record Distribution</>
              )}
            </button>
          </form>
        </div>

        {/* ── Stock Panel ───────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">View Zone Stocks</label>
            <div className="relative">
              <select
                onChange={(e) => setForm((p) => ({ ...p, _viewZone: e.target.value }))}
                className={selectClass}
                defaultValue=""
              >
                <option value="">Select a zone to view stocks…</option>
                {zones.map((z) => (
                  <option key={z.id_zone} value={z.id_zone}>{z.nom_zone}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <StockPanel zoneId={form._viewZone} />
        </div>
      </div>
    </div>
  );
}
