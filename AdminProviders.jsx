import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "./api.js";

export default function AdminProviders() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("pending");

  const load = () => api.get(`/admin/providers?status=${filter}`).then((r) => setItems(r.data.items));
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/providers/${id}/status`, { status });
      toast.success("Statut mis à jour");
      load();
    } catch { toast.error("Erreur"); }
  };

  const toggleFeatured = async (id, isFeatured) => {
    try {
      await api.patch(`/admin/providers/${id}/feature`, { isFeatured });
      toast.success("Mis à jour");
      load();
    } catch { toast.error("Erreur"); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-forest-100">
      <div className="flex flex-wrap gap-2 mb-6">
        {["pending", "approved", "rejected", "blocked", "hidden"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === s ? "bg-forest-800 text-cream" : "bg-forest-50 text-forest-800 hover:bg-forest-100"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-forest-700/70 border-b border-forest-100">
            <tr>
              <th className="py-3">Nom</th>
              <th className="py-3">Téléphone</th>
              <th className="py-3">Ville</th>
              <th className="py-3">Catégorie</th>
              <th className="py-3">Statut</th>
              <th className="py-3">Vedette</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b border-forest-50">
                <td className="py-3 font-medium text-forest-900">{p.name}</td>
                <td className="py-3 text-forest-700/80">{p.phone}</td>
                <td className="py-3">{p.city}</td>
                <td className="py-3">{p.category?.name}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    p.status === "approved" ? "bg-green-100 text-green-700" :
                    p.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    p.status === "hidden" ? "bg-slate-200 text-slate-700" :
                    "bg-red-100 text-red-700"
                  }`}>{p.status}</span>
                </td>
                <td className="py-3">
                  <button onClick={() => toggleFeatured(p._id, !p.isFeatured)}
                    className={`text-xs px-2 py-1 rounded ${p.isFeatured ? "bg-gold text-forest-900" : "bg-forest-50 text-forest-700"}`}>
                    {p.isFeatured ? "✦ Vedette" : "☆ Normal"}
                  </button>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {p.status !== "approved" && <button onClick={() => updateStatus(p._id, "approved")} className="text-green-600 font-medium hover:underline">Approuver</button>}
                    {p.status !== "rejected" && <button onClick={() => updateStatus(p._id, "rejected")} className="text-red-600 font-medium hover:underline">Rejeter</button>}
                    {p.status !== "blocked" && <button onClick={() => updateStatus(p._id, "blocked")} className="text-red-800 font-medium hover:underline">Bloquer</button>}
                    {p.status !== "hidden" && <button onClick={() => updateStatus(p._id, "hidden")} className="text-slate-600 font-medium hover:underline">Masquer</button>}
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr><td colSpan="7" className="text-center text-forest-700/70 py-8">Aucun prestataire dans cette catégorie.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}