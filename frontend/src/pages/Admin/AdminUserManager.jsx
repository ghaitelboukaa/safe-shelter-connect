import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldAlert, Plus, UserPlus, Loader2 } from "lucide-react";
import { adminService } from "../../api/adminService";
import { zoneService } from "../../api/zoneService";

export default function AdminUserManager() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", password: "", role: "admin", id_zone: "" });

  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneService.getAll().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => adminService.createUser(data),
    onSuccess: () => {
      toast.success("Admin user created successfully!");
      setForm({ email: "", password: "", role: "admin", id_zone: "" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, id_zone: form.role === "admin" ? parseInt(form.id_zone) : null });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <ShieldAlert className="h-5 w-5 text-indigo-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Admins</h1>
          <p className="text-slate-500 text-sm">Create and link administrators to specific zones</p>
        </div>
      </div>

      <div className="card p-8 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" required className="input-field" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" required className="input-field" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
              <option value="admin">Admin (Zone-Scoped)</option>
              <option value="super_admin">Super Admin (Global)</option>
            </select>
          </div>
          {form.role === "admin" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Zone</label>
              <select required className="input-field" value={form.id_zone} onChange={(e) => setForm({...form, id_zone: e.target.value})}>
                <option value="">Select a zone...</option>
                {zones?.map(z => <option key={z.id_zone} value={z.id_zone}>{z.nom_zone}</option>)}
              </select>
            </div>
          )}
          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full py-3">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create User
          </button>
        </form>
      </div>
    </div>
  );
}
