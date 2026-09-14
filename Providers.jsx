import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, Filter } from "lucide-react";
import { api } from "./api.js";

export default function Providers() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");
  const [city, setCity] = useState(params.get("city") || "");

  useEffect(() => { api.get("/categories").then((r) => setCategories(r.data)); }, []);

  useEffect(() => {
    const query = {
      q: params.get("q") || "",
      category: params.get("category") || "",
      city: params.get("city") || "",
    };
    api.get("/providers", { params: query }).then((r) => setItems(r.data.items));
  }, [params]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-forest-900">Tous les prestataires</h1>
      <p className="text-forest-700/70 mt-1">{items.length} prestataires trouvés</p>

      <div className="bg-white rounded-2xl shadow-sm border border-forest-100 p-4 mt-8 mb-8 grid gap-3 sm:grid-cols-3">
        <form onSubmit={(e) => { e.preventDefault(); update("q", q); }} className="relative">
          <Search size={18} className="absolute left-3 top-3.5 text-forest-700/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un prestataire…"
            className="w-full pl-10 pr-3 py-3 bg-cream rounded-xl outline-none border border-transparent focus:border-forest-700" />
        </form>
        <select value={params.get("category") || ""} onChange={(e) => update("category", e.target.value)}
          className="bg-cream rounded-xl px-3 py-3 outline-none border border-transparent focus:border-forest-700">
          <option value="">Toutes catégories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={16} className="absolute left-3 top-4 text-forest-700/50" />
            <input value={city} onChange={(e) => setCity(e.target.value)} onBlur={() => update("city", city)}
              placeholder="Toutes les villes"
              className="w-full pl-10 pr-3 py-3 bg-cream rounded-xl outline-none border border-transparent focus:border-forest-700" />
          </div>
          <button className="bg-forest-800 text-cream px-5 rounded-xl flex items-center gap-2 hover:bg-forest-900">
            <Filter size={16} /> Filtrer
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <Link key={p._id} to={`/prestataire/${p.slug}`}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-forest-100 transition group">
            <div className="relative h-48 bg-forest-100 bg-cover bg-center" style={{ backgroundImage: `url(${p.coverImage || ""})` }}>
              {p.isFeatured && (
                <span className="absolute top-3 right-3 bg-gold text-forest-900 text-xs font-bold px-3 py-1 rounded-full">
                  ✦ Vedette
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="text-xs text-forest-700/70 font-medium mb-1">{p.category?.name}</div>
              <h3 className="font-serif font-bold text-lg text-forest-900">{p.name}</h3>
              <p className="text-sm text-forest-700/70 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {p.city}
              </p>
              <div className="flex items-center gap-1 mt-3 text-gold">
                <Star size={14} fill="currentColor" />
                <span className="font-semibold text-forest-900">{p.rating || "—"}</span>
                <span className="text-forest-700/50 text-sm">({p.reviewsCount})</span>
              </div>
            </div>
          </Link>
        ))}
        {!items.length && (
          <p className="col-span-full text-center text-forest-700/70 py-20">Aucun prestataire trouvé.</p>
        )}
      </div>
    </div>
  );
}