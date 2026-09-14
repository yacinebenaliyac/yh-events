import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Users, Tags, LogOut, BarChart3 } from "lucide-react";
import { api } from "./api.js";
import { useAuth } from "./AuthContext.jsx";

export default function AdminDashboard() {
  const { logout, account } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);

  const links = [
    { to: "/admin", icon: <BarChart3 size={18} />, label: "Vue d'ensemble" },
    { to: "/admin/providers", icon: <Users size={18} />, label: "Prestataires" },
    { to: "/admin/categories", icon: <Tags size={18} />, label: "Catégories" },
  ];

  return (
    <div className="min-h-screen flex bg-forest-50">
      <aside className="w-64 bg-forest-900 text-cream/80 flex flex-col">
        <div className="p-6 border-b border-forest-800">
          <div className="text-xl font-serif font-bold text-cream">🎨 Y-H Events</div>
          <div className="text-xs text-cream/50 mt-1">Espace Admin</div>
          <div className="text-sm text-cream/60 mt-3">{account?.email}</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${loc.pathname === l.to ? "bg-forest-700 text-cream" : "hover:bg-forest-800"}`}>
              {l.icon} {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => { logout(); nav("/login"); }}
          className="m-4 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-forest-800">
          <LogOut size={18} /> Déconnexion
        </button>
      </aside>

      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {loc.pathname === "/admin" && stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { label: "Utilisateurs", value: stats.users },
                { label: "Prestataires", value: stats.providers },
                { label: "En attente", value: stats.pending },
                { label: "Demandes", value: stats.requests },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-forest-100">
                  <div className="text-3xl font-bold text-forest-800">{s.value}</div>
                  <div className="text-sm text-forest-700/70 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}