import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { connectSocket } from "./socketServer.js";
import { useAuth } from "./AuthContext.jsx";

export default function NotificationBell() {
  const { account } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!account) return;
    const s = connectSocket();
    if (!s) return;
    s.on("notification", (n) => setItems((arr) => [{ ...n, id: Date.now() }, ...arr]));
    return () => s.off("notification");
  }, [account]);

  if (!account) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-forest-800 hover:text-forest-900">
        <Bell size={20} />
        {items.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-forest-100 p-3 max-h-96 overflow-auto z-50">
          <div className="font-semibold text-forest-900 mb-2">Notifications</div>
          {items.length === 0 ? (
            <p className="text-sm text-forest-700/60 py-4 text-center">Aucune notification</p>
          ) : items.map((n, i) => (
            <div key={i} className="p-2 border-b border-forest-50 last:border-0">
              <div className="font-medium text-sm text-forest-900">{n.title}</div>
              <div className="text-xs text-forest-700/70">{n.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}