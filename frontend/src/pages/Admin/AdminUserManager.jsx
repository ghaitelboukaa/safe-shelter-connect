import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldAlert, ShieldCheck, UserPlus, Loader2, MapPin, Users, Mail,
} from "lucide-react";
import { adminService } from "../../api/adminService";
import { zoneService } from "../../api/zoneService";

export default function AdminUserManager() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", password: "", role: "admin", id_zone: "" });

  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneService.getAll().then((r) => r.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => adminService.getUsers().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => adminService.createUser(data),
    onSuccess: () => {
      toast.success("Admin user created successfully!");
      setForm({ email: "", password: "", role: "admin", id_zone: "" });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, id_zone: form.role === "admin" ? parseInt(form.id_zone) : null });
  };

  const admins = usersData?.users ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <ShieldAlert className="h-5 w-5 text-indigo-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Admins</h1>
          <p className="text-slate-500 text-sm">Create and link administrators to specific zones</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Create form ── */}
        <div className="card p-8">
          <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-indigo-600" />
            Create New Admin
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                className="input-field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin (Zone-Scoped)</option>
                <option value="super_admin">Super Admin (Global)</option>
              </select>
            </div>
            {form.role === "admin" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Zone</label>
                <select
                  required
                  className="input-field"
                  value={form.id_zone}
                  onChange={(e) => setForm({ ...form, id_zone: e.target.value })}
                >
                  <option value="">Select a zone...</option>
                  {zones?.map((z) => (
                    <option key={z.id_zone} value={z.id_zone}>{z.nom_zone}</option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full py-3">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Create User
            </button>
          </form>
        </div>

        {/* ── Admin list ── */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              Admin Accounts
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {admins.length} total
            </span>
          </div>

          <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
            {usersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex justify-between animate-pulse">
                  <div className="space-y-2">
                    <div className="h-3.5 w-40 bg-slate-100 rounded" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
              ))
            ) : admins.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                <Users className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                <p className="text-sm font-medium">No admin accounts yet.</p>
              </div>
            ) : (
              admins.map((admin) => (
                <div key={admin.id_user} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <p className="font-medium text-slate-800 text-sm truncate">{admin.email}</p>
                      </div>
                      {admin.zone_name && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {admin.zone_name}
                        </div>
                      )}
                    </div>
                    <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      admin.role === "super_admin"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-blue-50 text-blue-700"
                    }`}>
                      {admin.role === "super_admin" ? (
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Super</span>
                      ) : "Admin"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
