import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Music, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "./api.js";
import toast from "react-hot-toast";

export default function RegisterProvider() {
  const [categories, setCategories] = useState([]);
  const [contactPhone, setContactPhone] = useState("0669467938");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    username: "", name: "", email: "", phone: "", password: "", category: "", city: "", bio: "",
  });

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data));
    api.get("/auth/contact-info").then((r) => setContactPhone(r.data.phone)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/provider/register", form);
      setSubmitted(true);
      toast.success("Inscription envoyée !");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'inscription");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
        <div className="hidden lg:flex bg-forest-800 text-cream flex-col justify-center p-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-forest-700 rounded-2xl flex items-center justify-center mb-6">
              <Music size={36} className="text-gold" />
            </div>
            <h2 className="text-4xl font-serif font-bold">Rejoignez Y-H Events</h2>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 bg-cream">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
            <div className="w-20 h-20 mx-auto bg-forest-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-forest-700" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-forest-900">Inscription envoyée !</h1>
            <p className="mt-4 text-forest-700/80">Votre compte est en cours de validation par notre équipe.</p>

            <div className="bg-gold/20 border border-gold/40 rounded-2xl p-6 mt-8">
              <p className="font-semibold text-forest-900 flex items-center justify-center gap-2">
                <Phone size={18} /> Contactez l'administrateur
              </p>
              <a href={`tel:${contactPhone}`} className="text-3xl font-bold text-forest-900 mt-2 block">
                {contactPhone}
              </a>
              <p className="text-sm text-forest-700/70 mt-2">
                Appelez ce numéro pour accélérer la validation de votre compte.
              </p>
            </div>

            <Link to="/" className="inline-block mt-8 text-forest-800 font-semibold underline">← Retour à l'accueil</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-forest-800 text-cream flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative max-w-sm">
          <div className="w-20 h-20 mx-auto bg-forest-700 rounded-2xl flex items-center justify-center mb-6">
            <Music size={36} className="text-gold" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-center">Rejoignez Y-H Events</h2>
          <ul className="mt-8 space-y-3">
            {[
              "Profil professionnel complet",
              "Gestion de vos offres et tarifs",
              "Galerie photo et vidéo",
              "Réception des demandes de devis",
              "Visibilité auprès de milliers de clients",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-gold flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-cream overflow-y-auto">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-serif font-bold text-forest-900">Créer un compte</h1>
          <p className="text-forest-700/70 mt-2">
            Déjà inscrit ? <Link to="/login" className="text-forest-800 font-semibold underline">Se connecter</Link>
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-forest-900">Nom d'utilisateur *</label>
              <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="votre_pseudo" className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-900">Nom complet *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Prénom Nom" className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-900">Email (optionnel)</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="exemple@email.com" className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-900">Téléphone *</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="06 XX XX XX XX" className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-900">Mot de passe *</label>
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-forest-900">Catégorie *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700">
                  <option value="">Choisir…</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-forest-900">Ville *</label>
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Alger" className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-forest-900">Bio (optionnel)</label>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Présentez-vous en quelques mots…"
                className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
            </div>

            <div className="bg-gold/20 border border-gold/40 rounded-xl p-4 text-sm text-forest-900 flex items-start gap-3">
              <Phone size={18} className="text-forest-800 mt-0.5 flex-shrink-0" />
              <div>
                Après inscription, contactez l'administrateur au <strong>{contactPhone}</strong> pour valider votre compte.
              </div>
            </div>

            <button className="w-full bg-forest-800 hover:bg-forest-900 text-cream py-3 rounded-xl font-semibold">
              Continuer →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}