import { useState } from "react";
import { CreditCard, Wallet, DollarSign } from "lucide-react";
import { api } from "./api.js";
import toast from "react-hot-toast";

export default function PaymentPage({ booking }) {
  const [method, setMethod] = useState("cib");
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    try {
      const r = await api.post("/payments/create", {
        bookingId: booking?._id,
        amount: booking?.totalAmount || 0,
        method,
      });
      // En prod : redirection Stripe ou SATIM
      if (r.data.redirectUrl && method !== "cash") {
        window.location.href = r.data.redirectUrl;
      } else {
        await api.post(`/payments/${r.data.paymentId}/confirm`);
        toast.success("Paiement confirmé !");
      }
    } catch { toast.error("Erreur paiement"); }
    finally { setLoading(false); }
  };

  const methods = [
    { k: "cib", l: "CIB (Algérie Poste)", i: <CreditCard /> },
    { k: "edahabia", l: "Edahabia", i: <Wallet /> },
    { k: "stripe", l: "Carte internationale (Stripe)", i: <CreditCard /> },
    { k: "cash", l: "Espèces sur place", i: <DollarSign /> },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-forest-100">
      <h3 className="font-serif font-bold text-forest-900 mb-4">Mode de paiement</h3>
      <div className="space-y-2">
        {methods.map((m) => (
          <button key={m.k} onClick={() => setMethod(m.k)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
              method === m.k ? "border-forest-800 bg-forest-50" : "border-forest-100 hover:bg-forest-50/50"
            }`}>
            <span className="text-forest-800">{m.i}</span>
            <span className="text-sm font-medium text-forest-900">{m.l}</span>
          </button>
        ))}
      </div>
      <button onClick={pay} disabled={loading}
        className="w-full mt-6 bg-forest-800 text-cream py-3 rounded-xl font-semibold disabled:opacity-50">
        {loading ? "Traitement…" : "Payer maintenant"}
      </button>
    </div>
  );
}