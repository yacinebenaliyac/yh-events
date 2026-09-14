import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { api } from "./api.js";
import toast from "react-hot-toast";

export default function ProviderProfile() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", message: "", eventDate: "", budget: "" });

  useEffect(() => {
    api.get(`/providers/${slug}`).then((r) => setData(r.data)).catch(() => toast.error("Introuvable"));
  }, [slug]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/requests", {
        provider: data.provider._id,
        name: form.name,
        phone: form.phone,
        message: form.message,
        eventDate: form.eventDate || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
      });
      toast.success("Demande envoyée avec succès !");
      setForm({ name: "", phone: "", message: "", eventDate: "", budget: "" });
    } catch { toast.error("Erreur lors de l'envoi"); }
  };

  if (!data) return <div className="p-10 text-center text-forest-700">Chargement…</div>;
  const { provider, offers, reviews } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-forest-100">
        <div className="h-56 sm:h-72 bg-cover bg-center bg-forest-100" style={{ backgroundImage: `url(${provider.coverImage || ""})` }} />
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {provider.isFeatured && <span className="bg-gold text-forest-900 text-xs font-bold px-3 py-1 rounded-full">✦ Vedette</span>}
            <div className="text-sm text-forest-700/70 font-medium mt-3">{provider.category?.name}</div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-900 mt-1">{provider.name}</h1>
            <p className="text-forest-700/70 mt-2 flex items-center gap-1"><MapPin size={16} />{provider.city}</p>
            <div className="flex items-center gap-1 mt-3 text-gold">
              <Star size={18} fill="currentColor" />
              <span className="font-bold text-forest-900">{provider.rating || "—"}</span>
              <span className="text-forest-700/60">({provider.reviewsCount} avis)</span>
            </div>
            {provider.bio && <p className="mt-4 text-forest-700 whitespace-pre-line">{provider.bio}</p>}
          </div>
          <div className="flex flex-col gap-2 lg:w-64">
            <a href={`tel:${provider.phone}`} className="flex items-center justify-center gap-2 bg-forest-800 text-cream py-3 rounded-xl font-semibold hover:bg-forest-900">
              <Phone size={18} /> Appeler
            </a>
            <a href={`https://wa.me/${provider.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">
              <MessageCircle size={18} /> WhatsApp
            </a>
            {provider.email && (
              <a href={`mailto:${provider.email}`} className="flex items-center justify-center gap-2 border border-forest-200 py-3 rounded-xl font-semibold hover:bg-forest-50">
                <Mail size={18} /> Email
              </a>
            )}
          </div>
        </div>
      </div>

      {offers.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-serif font-bold mb-4 text-forest-900">Offres & Tarifs</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => (
              <div key={o._id} className="bg-white rounded-2xl p-5 shadow-sm border border-forest-100">
                <h3 className="font-serif font-bold text-lg text-forest-900">{o.title}</h3>
                <p className="text-forest-700/80 text-sm mt-2">{o.description}</p>
                <div className="mt-4 text-2xl font-extrabold text-forest-800">{o.price.toLocaleString()} {o.currency}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {provider.gallery?.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-serif font-bold mb-4 text-forest-900">Galerie</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {provider.gallery.map((src, i) => (
              <img key={i} src={src} alt="" className="rounded-xl object-cover w-full h-40" />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-forest-100">
        <h2 className="text-2xl font-serif font-bold mb-4 text-forest-900">Demander un devis</h2>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <input required placeholder="Votre nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-forest-100 bg-cream rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
          <input required placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border border-forest-100 bg-cream rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
          <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            className="border border-forest-100 bg-cream rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
          <input type="number" placeholder="Budget (DZD)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className="border border-forest-100 bg-cream rounded-xl px-4 py-3 outline-none focus:border-forest-700" />
          <textarea required rows={4} placeholder="Décrivez votre besoin..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="border border-forest-100 bg-cream rounded-xl px-4 py-3 outline-none focus:border-forest-700 sm:col-span-2" />
          <button className="sm:col-span-2 bg-forest-800 hover:bg-forest-900 text-cream py-3 rounded-xl font-semibold">Envoyer la demande</button>
        </form>
      </section>

      {reviews.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-serif font-bold mb-4 text-forest-900">Avis clients</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white rounded-2xl p-5 shadow-sm border border-forest-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-semibold text-forest-900">{r.user?.name || "Anonyme"}</div>
                  <div className="flex text-gold">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                </div>
                <p className="text-forest-700/80 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}