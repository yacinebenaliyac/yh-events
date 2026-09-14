import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "./api.js";

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", icon: "" });

  const load = () => api.get("/categories").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/categories", form);
      toast.success("Catégorie ajoutée");
      setForm({ name: "", icon: "" });
      load();
    } catch { toast.error("Erreur"); }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await api.delete(`/admin/categories/${id}`);
    toast.success("Supprimée");
    load();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-forest-100">
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3 mb-8">
        <input required placeholder="Nom (ex: Chanteurs)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-forest-100 bg-cream rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
        <input placeholder="Icône emoji (ex: 🎤)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="border border-forest-100 bg-cream rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
        <button className="bg-forest-800 hover:bg-forest-900 text-cream rounded-xl font-semibold py-3">Ajouter</button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <div key={c._id} className="flex items-center justify-between bg-forest-50 rounded-xl p-4 border border-forest-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.icon}</span>
              <span className="font-medium text-forest-900">{c.name}</span>
            </div>
            <button onClick={() => remove(c._id)} className="text-red-600 text-sm font-medium hover:underline">Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
}