import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Package, Send, Loader2, ChevronDown, AlertTriangle,
  BarChart3, RefreshCw, Plus, Database,
} from "lucide-react";
import { adminService } from "../../api/adminService";
import { zoneService, resourceService } from "../../api/zoneService";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

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
        <div className="px-5 py-10 text-center text-slate-400 text-sm">No stock recorded.</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {data?.stocks?.map((s) => (
            <div key={s.id_ressource} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-800 text-sm">{s.type_ressource}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">{s.unite_mesure}</p>
              </div>
              <div className={`text-sm font-black ${s.quantite_disponible < 50 ? "text-danger" : "text-emerald-600"}`}>
                {s.quantite_disponible < 50 && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                {s.quantite_disponible}
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
  const { isSuperAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("distribute"); // distribute | restock | catalog

  const [form, setForm] = useState({
    id_zone: "",
    id_ressource: "",
    id_sinistre: "",
    quantite: "",
    type_ressource: "",
    unite_mesure: "Unit",
  });

  const { data: zonesData } = useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneService.getAll().then((r) => r.data),
  });

  const { data: resourcesData } = useQuery({
    queryKey: ["resources"],
    queryFn: () => adminService.getResources().then((r) => r.data),
  });

  const zones = Array.isArray(zonesData) ? zonesData : [];
  const resources = resourcesData?.resources ?? [];

  // Mutations
  const distributeMutation = useMutation({
    mutationFn: (d) => adminService.recordDistribution(d),
    onSuccess: (res) => {
      toast.success("Distribution recorded!");
      queryClient.invalidateQueries({ queryKey: ["zoneStocks"] });
      setForm(p => ({ ...p, quantite: "", id_sinistre: "" }));
    },
  });

  const restockMutation = useMutation({
    mutationFn: ({ id_zone, id_res, qty }) => adminService.restock(id_zone, id_res, qty),
    onSuccess: () => {
      toast.success("Stock updated!");
      queryClient.invalidateQueries({ queryKey: ["zoneStocks"] });
      setForm(p => ({ ...p, quantite: "" }));
    },
  });

  const catalogMutation = useMutation({
    mutationFn: (d) => adminService.createResource(d),
    onSuccess: () => {
      toast.success("Resource added to catalog!");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setForm(p => ({ ...p, type_ressource: "" }));
    },
  });

  const handleDistribute = (e) => {
    e.preventDefault();
    distributeMutation.mutate({
      id_zone: parseInt(form.id_zone),
      id_ressource: parseInt(form.id_ressource),
      id_sinistre: form.id_sinistre ? parseInt(form.id_sinistre) : null,
      quantite_donnee: parseFloat(form.quantite),
    });
  };

  const handleRestock = (e) => {
    e.preventDefault();
    restockMutation.mutate({
      id_zone: parseInt(form.id_zone),
      id_res: parseInt(form.id_ressource),
      qty: parseFloat(form.quantite),
    });
  };

  const currentZone = zones.find(z => z.id_zone === parseInt(form.id_zone));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-xl"><Package className="h-5 w-5 text-amber-700" /></div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Logistics</h1>
          <p className="text-slate-500 text-sm">Manage inventory and distributions</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {["distribute", "restock"].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", 
              activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
          >
            {tab}
          </button>
        ))}
        {isSuperAdmin && (
          <button 
            onClick={() => setActiveTab("catalog")}
            className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", 
              activeTab === "catalog" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
          >
            Catalog
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          {activeTab === "distribute" && (
            <div className="card p-8">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Send className="h-4 w-4" /> Record Distribution</h3>
              <form onSubmit={handleDistribute} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Zone</label>
                    <select value={form.id_zone} onChange={(e) => setForm({...form, id_zone: e.target.value})} required className="input-field">
                      <option value="">Select Zone</option>
                      {zones.map(z => <option key={z.id_zone} value={z.id_zone}>{z.nom_zone}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Resource Type</label>
                    <select value={form.id_ressource} onChange={(e) => setForm({...form, id_ressource: e.target.value})} required className="input-field">
                      <option value="">Select Resource</option>
                      {resources.map(r => <option key={r.id_ressource} value={r.id_ressource}>{r.type_ressource} ({r.unite_mesure})</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Quantity</label>
                    <input type="number" step="0.1" value={form.quantite} onChange={(e) => setForm({...form, quantite: e.target.value})} required className="input-field" placeholder="0.0" />
                   </div>
                   <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Beneficiary ID (Optional)</label>
                    <input type="number" value={form.id_sinistre} onChange={(e) => setForm({...form, id_sinistre: e.target.value})} className="input-field" placeholder="ID" />
                   </div>
                </div>
                <button type="submit" disabled={distributeMutation.isPending} className="btn-primary w-full py-3">Confirm Distribution</button>
              </form>
            </div>
          )}

          {activeTab === "restock" && (
            <div className="card p-8">
               <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Plus className="h-4 w-4" /> Restock Zone</h3>
               <form onSubmit={handleRestock} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Zone</label>
                      <select value={form.id_zone} onChange={(e) => setForm({...form, id_zone: e.target.value})} required className="input-field">
                        <option value="">Select Zone</option>
                        {zones.map(z => <option key={z.id_zone} value={z.id_zone}>{z.nom_zone}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Resource Type</label>
                      <select value={form.id_ressource} onChange={(e) => setForm({...form, id_ressource: e.target.value})} required className="input-field">
                        <option value="">Select Resource</option>
                        {resources.map(r => <option key={r.id_ressource} value={r.id_ressource}>{r.type_ressource} ({r.unite_mesure})</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Restock Quantity</label>
                    <input type="number" step="1" value={form.quantite} onChange={(e) => setForm({...form, quantite: e.target.value})} required className="input-field" placeholder="Amount to add" />
                  </div>
                  <button type="submit" disabled={restockMutation.isPending} className="btn-primary w-full py-3">Add to Stock</button>
               </form>
            </div>
          )}

          {activeTab === "catalog" && (
            <div className="card p-8">
               <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Database className="h-4 w-4" /> Resource Catalog</h3>
               <form onSubmit={(e) => { e.preventDefault(); catalogMutation.mutate({ type_ressource: form.type_ressource, unite_mesure: form.unite_mesure }); }} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Resource Name</label>
                      <input value={form.type_ressource} onChange={(e) => setForm({...form, type_ressource: e.target.value})} required className="input-field" placeholder="e.g. Flour" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Unit</label>
                      <select value={form.unite_mesure} onChange={(e) => setForm({...form, unite_mesure: e.target.value})} className="input-field">
                        <option value="kg">kg</option>
                        <option value="Litre">Litre</option>
                        <option value="Box">Box</option>
                        <option value="Piece">Piece</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={catalogMutation.isPending} className="btn-primary w-full py-3">Register Resource</button>
               </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-12 xl:col-span-5">
           <StockPanel zoneId={form.id_zone} />
        </div>
      </div>
    </div>
  );
}
