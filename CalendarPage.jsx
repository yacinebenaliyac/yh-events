import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "./api.js";
import toast from "react-hot-toast";

export default function CalendarPage({ providerId }) {
  const [current, setCurrent] = useState(new Date());
  const [avail, setAvail] = useState([]);

  useEffect(() => {
    const from = new Date(current.getFullYear(), current.getMonth(), 1).toISOString();
    const to = new Date(current.getFullYear(), current.getMonth() + 1, 0).toISOString();
    api.get(`/availability/${providerId}`, { params: { from, to } })
      .then((r) => setAvail(r.data)).catch(() => {});
  }, [current, providerId]);

  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const firstDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay();

  const dayAvail = (day) => {
    const d = new Date(current.getFullYear(), current.getMonth(), day).toDateString();
    return avail.find((a) => new Date(a.date).toDateString() === d);
  };

  const book = async (day) => {
    const a = dayAvail(day);
    if (!a?.isAvailable) return toast.error("Jour indisponible");
    try {
      await api.post("/bookings", {
        provider: providerId,
        date: new Date(current.getFullYear(), current.getMonth(), day).toISOString(),
      });
      toast.success("Demande de réservation envoyée");
    } catch { toast.error("Erreur"); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-forest-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1))} className="p-2 hover:bg-forest-50 rounded-lg">
          <ChevronLeft />
        </button>
        <h3 className="font-serif font-bold text-forest-900 text-lg">
          {current.toLocaleString("fr-FR", { month: "long", year: "numeric" })}
        </h3>
        <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1))} className="p-2 hover:bg-forest-50 rounded-lg">
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-forest-700/60 mb-2">
        {["D","L","M","M","J","V","S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const a = dayAvail(day);
          const status = a?.isAvailable === false ? "bg-red-50 text-red-700"
            : a?.isAvailable ? "bg-forest-100 text-forest-900 hover:bg-gold cursor-pointer"
            : "bg-forest-50 text-forest-700 hover:bg-forest-100 cursor-pointer";
          return (
            <button key={day} onClick={() => book(day)} className={`aspect-square rounded-lg text-sm font-medium transition ${status}`}>
              {day}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-4 text-xs text-forest-700/70">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-forest-100 border" /> Dispo</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border" /> Indispo</span>
      </div>
    </div>
  );
}