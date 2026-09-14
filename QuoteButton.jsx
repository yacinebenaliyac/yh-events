import { Download } from "lucide-react";
import { api } from "./api.js";
import toast from "react-hot-toast";

export default function QuoteButton({ quote }) {
  const download = async () => {
    try {
      const r = await api.get(`/quotes/${quote._id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `devis-${quote.number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Erreur téléchargement"); }
  };

  return (
    <button onClick={download}
      className="flex items-center gap-2 bg-forest-800 text-cream px-4 py-2 rounded-xl text-sm font-medium hover:bg-forest-900">
      <Download size={16} /> Télécharger PDF
    </button>
  );
}