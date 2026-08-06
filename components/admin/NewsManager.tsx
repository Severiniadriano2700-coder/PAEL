"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  authorName: string | null;
  publishedAt: string;
};

type FormState = { title: string; content: string; imageUrl: string; authorName: string };
const EMPTY_FORM: FormState = { title: "", content: "", imageUrl: "", authorName: "" };

export default function NewsManager({ initialNews }: { initialNews: NewsItem[] }) {
  const router = useRouter();
  const [news, setNews] = useState(initialNews);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  }

  function openEdit(item: NewsItem) {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl ?? "",
      authorName: item.authorName ?? "",
    });
    setError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("El título y el contenido son obligatorios.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const url = editing ? `/api/admin/noticias/${editing.id}` : "/api/admin/noticias";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la noticia.");

      if (editing) {
        setNews((prev) => prev.map((n) => (n.id === editing.id ? data.news : n)));
      } else {
        setNews((prev) => [data.news, ...prev]);
      }
      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: NewsItem) {
    if (!confirm(`¿Eliminar la noticia "${item.title}"?`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/admin/noticias/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar.");
      setNews((prev) => prev.filter((n) => n.id !== item.id));
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div />
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-gold text-black font-bold text-xs uppercase tracking-wide px-4 py-2.5 rounded-md hover:bg-[#dbb432] transition-colors"
        >
          <Plus size={14} /> Nueva noticia
        </button>
      </div>

      {news.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted text-sm">
          Todavía no se ha publicado ninguna noticia.
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <div key={item.id} className="bg-surface border border-border rounded-xl p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-bold text-sm">{item.title}</div>
                <div className="text-xs text-muted mt-1 line-clamp-2">{item.content}</div>
                <div className="text-[10px] text-muted mt-1.5">
                  {new Date(item.publishedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                  {item.authorName ? ` · ${item.authorName}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-md border border-border text-muted hover:text-gold hover:border-gold transition-colors"
                  title="Editar"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="p-1.5 rounded-md border border-border text-muted hover:text-loss hover:border-loss transition-colors disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg bg-surface border border-border rounded-xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display uppercase text-xl">{editing ? "Editar noticia" : "Nueva noticia"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <FormField label="Título" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Título de la noticia" />
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">Contenido</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={6}
                  placeholder="Texto de la noticia"
                  className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors resize-y"
                />
              </div>
              <FormField label="URL de imagen (opcional)" value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} placeholder="https://..." />
              <FormField label="Autor (opcional)" value={form.authorName} onChange={(v) => setForm((f) => ({ ...f, authorName: v }))} placeholder="ej. Redacción PAEL" />

              {error && <p className="text-xs text-loss border border-loss/40 bg-loss/10 rounded-md px-3 py-2">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-border text-muted text-xs uppercase tracking-wide font-bold py-2.5 rounded-md hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-gold text-black text-xs uppercase tracking-wide font-bold py-2.5 rounded-md hover:bg-[#dbb432] transition-colors disabled:opacity-60">
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
      />
    </div>
  );
}
