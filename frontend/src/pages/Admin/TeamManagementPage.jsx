import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Plus, Pencil, Trash2, Loader2, X, Check, MapPin, Phone, SearchX } from "lucide-react";
import { adminService } from "../../api/adminService";
import { zoneService } from "../../api/zoneService";
import { SearchInput } from "../../components/shared/SearchInput";

function TeamModal({ team, onClose, onSave, isSaving }) {
  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneService.getAll().then((r) => r.data),
  });

  const [form, setForm] = useState({
    role: team?.role ?? "",
    contact: team?.contact ?? "",
    id_zone: team?.id_zone ?? "",
  });

  const isEdit = !!team;
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id_zone: parseInt(form.id_zone) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? "Edit Team" : "New Team"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Team Role</label>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required placeholder="e.g. Medical Unit" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact</label>
            <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required placeholder="e.g. +212 600..." className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Zone</label>
            <select value={form.id_zone} onChange={(e) => setForm({ ...form, id_zone: e.target.value })} required className="input-field">
              <option value="">Select Zone</option>
              {zones?.map(z => <option key={z.id_zone} value={z.id_zone}>{z.nom_zone}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5">Cancel</button>
            <button type="submit" disabled={isSaving} className="btn-primary flex-1 py-2.5">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamManagementPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => adminService.getTeams().then((r) => r.data.teams),
  });

  const createMutation = useMutation({
    mutationFn: (d) => adminService.createTeam(d),
    onSuccess: () => { toast.success("Team created!"); queryClient.invalidateQueries({ queryKey: ["teams"] }); setModal(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updateTeam(id, data),
    onSuccess: () => { toast.success("Team updated!"); queryClient.invalidateQueries({ queryKey: ["teams"] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteTeam(id),
    onSuccess: () => { toast.success("Team deleted."); queryClient.invalidateQueries({ queryKey: ["teams"] }); },
  });

  const filteredTeams = (teams || []).filter(t =>
    t.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl"><Users className="h-5 w-5 text-emerald-700" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Teams</h1>
            <p className="text-slate-500 text-sm">Manage response personnel across zones</p>
          </div>
        </div>
        <button onClick={() => setModal({ mode: "create" })} className="btn-primary py-2.5"><Plus className="h-4 w-4" /> New Team</button>
      </div>

      <div className="max-w-md">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search teams by role or contact..."
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-5 h-32 animate-pulse bg-slate-100" />)
        ) : filteredTeams.length === 0 && teams?.length > 0 ? (
          <div className="col-span-full card p-16 text-center text-slate-400 border-dashed border-2">
            <SearchX className="h-12 w-12 mx-auto mb-3 text-slate-200" />
            <p className="font-medium">No teams match your search "{searchTerm}"</p>
            <button onClick={() => setSearchTerm("")} className="text-primary-800 text-sm font-bold mt-2">Clear search</button>
          </div>
        ) : teams?.length === 0 ? (
          <div className="col-span-full card p-16 text-center text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-200" />
            <p className="font-medium">No teams yet. Create the first one!</p>
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div key={team.id_equipe} className="card p-5 group transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{team.role}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Phone className="h-3 w-3" /> {team.contact}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal({ mode: "edit", team })} className="p-1.5 hover:bg-blue-100 rounded-lg text-slate-400"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteMutation.mutate(team.id_equipe)} className="p-1.5 hover:bg-red-100 rounded-lg text-slate-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && <TeamModal team={modal.team} onClose={() => setModal(null)} onSave={(d) => modal.mode === "edit" ? updateMutation.mutate({ id: modal.team.id_equipe, data: d }) : createMutation.mutate(d)} isSaving={createMutation.isPending || updateMutation.isPending} />}
    </div>
  );
}
