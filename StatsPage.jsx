import { useEffect, useState } from "react";
import { Eye, MessageSquare, Calendar, DollarSign } from "lucide-react";
import { api } from "./api.js";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";

export default function StatsPage() {
  const [data, setData] = useState({ stats: [], totals: {} });

  useEffect(() => {
    api.get("/stats/me").then((r) => setData(r.data)).catch(() => {});
  }, []);

  const chart = data.stats.map((s) => ({
    date: new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    vues: s.views,
    demandes: s.requests,
    réservations: s.bookings,
  }));

  const cards = [
    { l: "Vues totales", v: data.totals.views, i: <Eye />, c: "text-blue-600" },
    { l: "Demandes", v: data.totals.requests, i: <MessageSquare />, c: "text-forest-700" },
    { l: "Réservations", v: data.totals.bookings, i: <Calendar />, c: "text-gold" },
    { l: "Revenu (DZD)", v: data.totals.revenue, i: <DollarSign />, c: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.l} className="bg-white rounded-2xl p-5 shadow-sm border border-forest-100">
            <div className={`${c.c} mb-2`}>{c.i}</div>
            <div className="text-3xl font-bold text-forest-900">{c.v || 0}</div>
            <div className="text-sm text-forest-700/70 mt-1">{c.l}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
        <h3 className="font-serif font-bold text-forest-900 mb-4">Évolution (30 derniers jours)</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={chart}>
              <CartesianGrid stroke="#e0e8e0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="vues" stroke="#234027" strokeWidth={2} />
              <Line type="monotone" dataKey="demandes" stroke="#d4b878" strokeWidth={2} />
              <Line type="monotone" dataKey="réservations" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}