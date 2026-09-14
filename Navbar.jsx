import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Music } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "./AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { account, role, logout } = useAuth();
  const nav = useNavigate();

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/prestataires", label: "Prestataires" },
    { to: "/categories", label: "Catégories" },
  ];

  const dash = role === "admin" ? "/admin" : role === "provider" ? "/dashboard" : null;

  return (
    <header className="bg-cream/90 backdrop-blur-md border-b border-forest-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-forest-900">
          <Music size={22} /> My Events
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-forest-800 hover:text-forest-900 font-medium transition">
              {l.label}
            </Link>
          ))}

          {account ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              {dash && (
                <Link to={dash} className="text-forest-700 font-semibold">
                  Mon espace
                </Link>
              )}
              <button
                onClick={() => { logout(); nav("/"); }}
                className="text-sm text-forest-700/70 hover:text-red-600"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-forest-800 font-medium">Connexion</Link>
              <Link
                to="/devenir-prestataire"
                className="bg-forest-800 hover:bg-forest-900 text-cream px-5 py-2 rounded-lg font-semibold transition"
              >
                Devenir prestataire
              </Link>
            </div>
          )}
        </nav>

        <button className="md:hidden text-forest-900" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t bg-cream px-4 py-4 space-y-3"
        >
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-forest-800 py-2">
              {l.label}
            </Link>
          ))}

          {account ? (
            <>
              {dash && (
                <Link to={dash} className="block font-semibold py-2" onClick={() => setOpen(false)}>
                  Mon espace
                </Link>
              )}
              <button
                onClick={() => { logout(); nav("/"); setOpen(false); }}
                className="text-red-600 py-2"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2">Connexion</Link>
              <Link
                to="/devenir-prestataire"
                onClick={() => setOpen(false)}
                className="block bg-forest-800 text-cream text-center py-2 rounded-lg"
              >
                Devenir prestataire
              </Link>
            </>
          )}
        </motion.div>
      )}
    </header>
  );
}