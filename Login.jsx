import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Music } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState("provider");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password, role);
      toast.success("Connexion réussie");
      if (role === "admin") nav("/admin");
      else if (role === "provider") nav("/dashboard");
      else nav("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-forest-800 text-cream flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 mx-auto bg-forest-700 rounded-2xl flex items-center justify-center mb-6">
            <Music size={36} className="text-gold" />
          </div>
          <h2 className="text-4xl font-serif font-bold">Y-H Events</h2>
          <p className="mt-3 text-cream/80 max-w-sm">
            La plateforme des prestataires artistiques et événementiels en Algérie.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-cream">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-4xl font-serif font-bold text-forest-900">Connexion</h1>
          <p className="text-forest-700/70 mt-2">
            Pas encore inscrit ? <Link to="/devenir-prestataire" className="text-forest-800 font-semibold underline">Créer un compte</Link>
          </p>

          <div className="grid grid-cols-3 gap-2 mt-8 p-1 bg-forest-50 rounded-xl">
            {[
              { k: "provider", l: "Prestataire" },
              { k: "user", l: "Client" },
              { k: "admin", l: "Admin" },
            ].map((r) => (
              <button key={r.k} type="button" onClick={() => setRole(r.k)}
                className={`py-2 rounded-lg text-sm font-medium transition ${role === r.k ? "bg-forest-800 text-cream shadow" : "text-forest-800 hover:bg-cream"}`}>
                {r.l}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-forest-900">
                {role === "provider" ? "Téléphone ou pseudo" : "Email"}
              </label>
              <input required value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === "provider" ? "votre_pseudo ou 06…" : "exemple@email.com"}
                className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-900">Mot de passe</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 border border-forest-100 bg-white rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
            </div>
            <button disabled={loading} className="w-full bg-forest-800 hover:bg-forest-900 text-cream py-3 rounded-xl font-semibold">
              {loading ? "…" : "Se connecter"}
            </button>
          </form>

          <Link to="/" className="block text-center text-forest-700/70 mt-6 hover:text-forest-900">← Retour à l'accueil</Link>
        </motion.div>
      </div>
    </div>
  );
}