import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "./api.js";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [q, setQ] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
    api.get("/providers?featured=true&limit=4").then((r) => setFeatured(r.data.items)).catch(() => {});
  }, []);

  return (
    <>
      <section className="relative bg-forest-800 text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gold rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-forest-700 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block border border-gold/40 text-gold px-4 py-1 rounded-full text-sm font-medium mb-6">
            Plateforme N°1 en Algérie
          </motion.span>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight">
            Trouvez le prestataire parfait<br />
            <span className="text-gold">pour votre événement</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-6 text-cream/80 text-lg max-w-2xl mx-auto">
            Chanteurs, photographes, coiffeurs, organisateurs… Découvrez les meilleurs artistes et prestataires près de chez vous.
          </motion.p>

          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            onSubmit={(e) => { e.preventDefault(); nav(`/prestataires?q=${q}`); }}
            className="mt-10 bg-cream rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex items-center flex-1 px-4">
              <Search size={20} className="text-forest-700/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Chanteur, photographe, coiffeur…"
                className="flex-1 bg-transparent px-3 py-3 outline-none text-forest-900 placeholder:text-forest-700/50" />
            </div>
            <div className="flex items-center border-l border-forest-100 px-4">
              <MapPin size={18} className="text-forest-700/50" />
              <select className="bg-transparent px-2 py-3 outline-none text-forest-900">
                <option>Toutes les villes</option>
                <option>Alger</option>
                <option>Oran</option>
                <option>Constantine</option>
                <option>Annaba</option>
              </select>
            </div>
            <button className="bg-forest-800 hover:bg-forest-900 text-cream font-semibold px-6 py-3 rounded-xl transition">
              Rechercher
            </button>
          </motion.form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-forest-900">Catégories</h2>
            <p className="text-forest-700/70 mt-1">Explorez par spécialité</p>
          </div>
          <Link to="/categories" className="text-forest-800 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Voir tout <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`/prestataires?category=${c._id}`}
                className="block bg-cream rounded-2xl p-5 text-center border border-forest-100 hover:border-forest-700 hover:shadow-lg transition group">
                <div className="w-12 h-12 mx-auto rounded-full bg-forest-50 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition">
                  {c.icon}
                </div>
                <div className="font-medium text-forest-900 text-sm">{c.name}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-cream/60 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-forest-900">Prestataires vedettes</h2>
              <p className="text-forest-700/70 mt-1">Les mieux notés, sélectionnés pour vous</p>
            </div>
            <Link to="/prestataires" className="text-forest-800 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Voir tous <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link key={p._id} to={`/prestataire/${p.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition">
                <div className="relative h-56 bg-forest-100 bg-cover bg-center" style={{ backgroundImage: `url(${p.coverImage || ""})` }}>
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
                  <div className="flex items-center gap-1 mt-2 text-gold">
                    <Star size={14} fill="currentColor" />
                    <span className="font-semibold text-forest-900">{p.rating || "—"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-forest-800 text-cream rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-gold rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold">Vous êtes artiste ou prestataire ?</h2>
            <p className="mt-4 text-cream/80 max-w-2xl mx-auto">
              Créez votre profil gratuitement, présentez vos offres et connectez-vous avec des milliers de clients potentiels.
            </p>
            <Link to="/devenir-prestataire"
              className="inline-block mt-8 bg-cream text-forest-900 font-semibold px-8 py-3 rounded-xl hover:bg-gold transition">
              Rejoindre la plateforme
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}