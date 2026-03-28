import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MapPin, Plus, Pencil, Trash2, Loader2, X, Check, Users,
} from "lucide-react";
import { zoneService } from "../../api/zoneService";
import { ProgressBar } from "../../components/ui/ProgressBar";

// ── Zone Form Modal ────────────────────────────────────────────────────────
function ZoneModal({ zone, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    nom_zone: zone?.nom_zone ?? "",
    adress_gps: zone?.adress_gps ?? "",
    capacite_max: zone?.capacite_max ?? "",
  });

  const isEdit = !!zone;
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, capacite_max: parseInt(form.capacite_max) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit Zone" : "Create New Zone"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Zone Name</label>
            <input
              name="nom_zone"
              value={form.nom_zone}
              onChange={handleChange}
              required
              placeholder="e.g. Zone Marrakech Nord"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">GPS Address</label>
            <input
              name="adress_gps"
              value={form.adress_gps}
              onChange={handleChange}
              placeholder="e.g. 31.6295° N, 7.9811° W"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Capacity</label>
            <input
              name="capacite_max"
              type="number"
              min={1}
              value={form.capacite_max}
              onChange={handleChange}
              required
              placeholder="e.g. 200"
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary flex-1 py-2.5 text-sm">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {isEdit ? "Save Changes" : "Create Zone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminZonesPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null); // null | { mode: 'create' | 'edit', zone? }
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adminZones"],
    queryFn: () => zoneService.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => zoneService.create(d),
    onSuccess: () => {
      toast.success("Zone created!");
      queryClient.invalidateQueries({ queryKey: ["adminZones"] });
      setModal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => zoneService.update(id, data),
    onSuccess: () => {
      toast.success("Zone updated!");
      queryClient.invalidateQueries({ queryKey: ["adminZones"] });
      setModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => zoneService.delete(id),
    onSuccess: () => {
      toast.success("Zone deleted.");
      queryClient.invalidateQueries({ queryKey: ["adminZones"] });
      setDeletingId(null);
    },
    onError: () => setDeletingId(null),
  });

  const handleSave = (formData) => {
    if (modal?.mode === "edit" && modal.zone) {
      updateMutation.mutate({ id: modal.zone.id_zone, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const zones = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <MapPin className="h-5 w-5 text-primary-800" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Zones</h1>
            <p className="text-slate-500 text-sm">Manage shelter zones and capacity</p>
          </div>
        </div>
        <button
          id="create-zone-btn"
          onClick={() => setModal({ mode: "create" })}
          className="btn-primary text-sm py-2.5"
        >
          <Plus className="h-4 w-4" /> New Zone
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-5 w-32 rounded" />
              <div className="skeleton h-3 w-48 rounded" />
              <div className="skeleton h-2 w-full rounded-full mt-2" />
            </div>
          ))}
        </div>
      ) : zones.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-200" />
          <p className="font-medium">No zones yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => {
            const pct = zone.capacite_max > 0
              ? Math.round(((zone.capacite_max - zone.capacite_restante) / zone.capacite_max) * 100)
              : 0;

            return (
              <div key={zone.id_zone} className="card p-5 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{zone.nom_zone}</h3>
                    {zone.adress_gps && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{zone.adress_gps}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal({ mode: "edit", zone })}
                      className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-primary-800 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(zone.id_zone);
                        deleteMutation.mutate(zone.id_zone);
                      }}
                      disabled={deletingId === zone.id_zone}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-danger transition-colors disabled:opacity-50"
                    >
                      {deletingId === zone.id_zone ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Capacity info */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {zone.capacite_max - zone.capacite_restante} / {zone.capacite_max} occupied
                  </span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <ProgressBar value={pct} />
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ZoneModal
          zone={modal.zone}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
