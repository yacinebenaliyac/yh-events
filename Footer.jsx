import { Link } from "react-router-dom";
import { Music, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-cream/80 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-cream text-xl font-serif font-bold mb-3">
            <Music size={20} /> Y-H Events
          </div>
          <p className="text-sm">La plateforme de référence pour trouver les meilleurs prestataires artistiques et événementiels en Algérie.</p>
        </div>
        <div>
          <h4 className="text-cream font-semibold mb-3">Navigation</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-gold">Accueil</Link></li>
            <li><Link to="/prestataires" className="hover:text-gold">Prestataires</Link></li>
            <li><Link to="/categories" className="hover:text-gold">Catégories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-cream font-semibold mb-3">Prestataires</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/devenir-prestataire" className="hover:text-gold">S'inscrire</Link></li>
            <li><Link to="/login" className="hover:text-gold">Se connecter</Link></li>
            <li><Link to="/dashboard" className="hover:text-gold">Mon espace</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-cream font-semibold mb-3">Contact</h4>
          <p className="text-sm flex items-center gap-2"><Phone size={14} /> 0669467938</p>
        </div>
      </div>
      <p className="text-center text-xs mt-10 text-cream/40">© {new Date().getFullYear()} Y-H Events — Tous droits réservés</p>
    </footer>
  );
}