import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "./api.js";

export default function AdminPromos() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: "", discountType: "percent", discountValue: 10, maxUses: 100, minAmount: 0 });

  const load = () => api.get("/admin/promos").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/promos", form);
      toast.success("Code créé");
      setForm({ code: "", discountType: "percent", discountValue: 10, maxUses: 100, minAmount: 0 });
      load();
    } catch { toast.error("Erreur"); }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer ce code ?")) return;
    await api.delete(`/admin/promos/${id}`); load();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-forest-100">
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-5 mb-6">
        <input required placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          className="border border-forest-100 bg-cream rounded-xl px-3 py-2" />
        <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          className="border border-forest-100 bg-cream rounded-xl px-3 py-2">
          <option value="percent">%</option>
          <option value="fixed">Fixe (DZD)</option>
        </select>
        <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
          className="border border-forest-100 bg-cream rounded-xl px-3 py-2" />
        <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
          placeholder="Max utilisations" className="border border-forest-100 bg-cream rounded-xl px-3 py-2" />
        <button className="bg-forest-800 text-cream rounded-xl font-semibold">Créer</button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <div key={p._id} className="bg-forest-50 border border-forest-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono font-bold text-forest-900">{p.code}</span>
              <button onClick={() => remove(p._id)} className="text-red-600 text-xs">Supprimer</button>
            </div>
            <div className="text-sm text-forest-700">
              {p.discountType === "percent" ? `-${p.discountValue}%` : `-${p.discountValue} DZD`}
            </div>
            <div className="text-xs text-forest-700/60 mt-1">
              {p.usedCount}/{p.maxUses} utilisés
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}