import { useState } from "react";
import { Upload, X } from "lucide-react";
import { api } from "./api.js";
import toast from "react-hot-toast";

export default function UploadZone({ onUploaded, multiple = true }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (list) => setFiles(Array.from(list));

  const upload = async () => {
    if (!files.length) return;
    setLoading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("photos", f));
    try {
      const r = await api.post("/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Images envoyées");
      onUploaded?.(r.data.urls);
      setFiles([]);
    } catch { toast.error("Erreur upload"); }
    finally { setLoading(false); }
  };

  return (
    <div className="border-2 border-dashed border-forest-200 rounded-2xl p-6 text-center bg-forest-50/40">
      <input type="file" accept="image/*" multiple={multiple} onChange={(e) => handleFiles(e.target.files)}
        className="hidden" id="upload-input" />
      <label htmlFor="upload-input" className="cursor-pointer flex flex-col items-center gap-2">
        <Upload className="text-forest-700" size={32} />
        <span className="text-sm text-forest-700">Cliquez pour choisir des images</span>
      </label>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative">
              <img src={URL.createObjectURL(f)} alt="" className="rounded-lg h-20 w-full object-cover" />
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <button onClick={upload} disabled={loading}
          className="mt-4 bg-forest-800 text-cream px-4 py-2 rounded-xl font-medium disabled:opacity-50">
          {loading ? "Envoi…" : `Envoyer ${files.length} image(s)`}
        </button>
      )}
    </div>
  );
}