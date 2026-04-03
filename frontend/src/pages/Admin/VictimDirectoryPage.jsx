import { useQuery } from "@tanstack/react-query";
import { Users, ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { adminService } from "../../api/adminService";
import { useState, useEffect } from "react";
import { SearchInput } from "../../components/shared/SearchInput";

export default function VictimDirectoryPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["victims", page, searchTerm],
    queryFn: () => adminService.getVictims(page, searchTerm).then((r) => r.data),
  });

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-xl"><Users className="h-5 w-5 text-purple-700" /></div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Victim Directory</h1>
          <p className="text-slate-500 text-sm">Monitor and search all registered sinistres</p>
        </div>
      </div>

      <div className="max-w-md">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name or CIN..."
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">CIN</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                  </tr>
                ))
              ) : data?.victims?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <SearchX className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-400 font-medium">No victims found matching "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm("")} className="text-primary-800 text-xs font-bold mt-2">Clear search</button>
                  </td>
                </tr>
              ) : data?.victims?.map((v) => (
                <tr key={v.id_sinistre} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{v.nom} {v.prenom}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{v.cin}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{v.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${v.statut_reservation === "Confirmed" ? "bg-emerald-100 text-emerald-700" : 
                        v.statut_reservation === "Pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {v.statut_reservation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100">
             <p className="text-xs text-slate-400 font-medium">Page {page} of {Math.ceil((data?.total || 0) / 10)}</p>
             <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil((data?.total || 0) / 10)} className="p-1 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"><ChevronRight className="h-4 w-4" /></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
