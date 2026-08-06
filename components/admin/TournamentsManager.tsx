"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type Tournament = {
  id: string;
  name: string;
  format: string;
  prizePool: string | null;
  startDate: string;
  endDate: string | null;
  entryFeePerPlayer: number | null;
  bannerUrl: string | null;
  status: string;
};

type FormState = {
  name: string;
  format: string;
  prizePool: string;
  startDate: string;
  endDate: string;
  entryFeePerPlayer: string;
  bannerUrl: string;
};

const EMPTY_FORM: FormState = { name: "", format: "", prizePool: "", startDate: "", endDate: "", entryFeePerPlayer: "", bannerUrl: "" };

const STATUS_LABEL: Record<string, string> = { UPCOMING: "Próximo", ONGOING: "En curso", FINISHED: "Finalizado" };

function toDateInput(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function TournamentsManager({ initialTournaments }: { initialTournaments: Tournament[] }) {
  const router = useRouter();
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  }

  function openEdit(t: Tournament) {
    setEditing(t);
    setForm({
      name: t.name,
      format: t.format,
      prizePool: t.prizePool ?? "",
      startDate: toDateInput(t.startDate),
      endDate: toDateInput(t.endDate),
      entryFeePerPlayer: t.entryFeePerPlayer?.toString() ?? "",
      bannerUrl: t.bannerUrl ?? "",
    });
    setError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.format.trim() || !form.startDate) {
      setError("Nombre, formato y fecha de inicio son obligatorios.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const url = editing ? `/api/admin/torneos/${editing.id}` : "/api/admin/torneos";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, endDate: form.endDate || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el torneo.");

      if (editing) {
        setTournaments((prev) => prev.map((t) => (t.id === editing.id ? data.tournament : t)));
      } else {
        setTournaments((prev) => [data.tournament, ...prev]);
      }
      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(t: Tournament, status: string) {
    const res = await fetch(`/api/admin/torneos/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      setTournaments((prev) => prev.map((x) => (x.id === t.id ? data.tournament : x)));
      router.refresh();
    }
  }

  async function handleDelete(t: Tournament) {
    setDeleteError(null);
    if (!confirm(`¿Eliminar el torneo "${t.name}"?`)) return;
    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/admin/torneos/${t.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar.");
      setTournaments((prev) => prev.filter((x) => x.id !== t.id));
      router.refresh();
    } catch (err: any) {
      setDeleteError({ id: t.id, message: err.message });
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
          <Plus size={14} /> Nuevo torneo
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted text-sm">
          Todavía no hay torneos creados.
        </div>
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <div key={t.id} className="bg-surface border border-border rounded-xl p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display uppercase text-lg leading-none">{t.name}</h3>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t, e.target.value)}
                    className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded border border-border bg-black text-muted"
                  >
                    {Object.entries(STATUS_LABEL).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-muted mt-1">
                  {t.format} · {new Date(t.startDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                  {t.endDate ? ` – ${new Date(t.endDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}` : ""}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {t.prizePool ? `Premio: ${t.prizePool}` : ""}
                  {t.entryFeePerPlayer ? ` · ${t.entryFeePerPlayer}€/jugador` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/admin/torneos/${t.id}`}
                  className="text-[10px] uppercase font-bold text-gold border border-gold/40 rounded px-2 py-1.5 hover:bg-gold/10 transition-colors"
                >
                  Gestionar partidos
                </a>
                <button
                  onClick={() => openEdit(t)}
                  className="p-1.5 rounded-md border border-border text-muted hover:text-gold hover:border-gold transition-colors"
                  title="Editar"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  disabled={deletingId === t.id}
                  className="p-1.5 rounded-md border border-border text-muted hover:text-loss hover:border-loss transition-colors disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {deleteError?.id === t.id && (
                <p className="text-loss text-[10px] mt-1.5 text-right max-w-[220px] ml-auto">{deleteError.message}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg bg-surface border border-border rounded-xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display uppercase text-xl">{editing ? "Editar torneo" : "Nuevo torneo"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <FormField label="Nombre" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="ej. ProAm Elite Tournament" />
              <FormField label="Formato" value={form.format} onChange={(v) => setForm((f) => ({ ...f, format: v }))} placeholder="ej. Eliminación directa" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">Fecha inicio</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">Fecha fin (opcional)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Premio (opcional)" value={form.prizePool} onChange={(v) => setForm((f) => ({ ...f, prizePool: v }))} placeholder="ej. 500€" />
                <FormField label="Precio/jugador (opcional)" value={form.entryFeePerPlayer} onChange={(v) => setForm((f) => ({ ...f, entryFeePerPlayer: v }))} placeholder="ej. 5.00" />
              </div>
              <FormField label="URL de banner (opcional)" value={form.bannerUrl} onChange={(v) => setForm((f) => ({ ...f, bannerUrl: v }))} placeholder="https://..." />

              {error && <p className="text-xs text-loss border border-loss/40 bg-loss/10 rounded-md px-3 py-2">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-border text-muted text-xs uppercase tracking-wide font-bold py-2.5 rounded-md hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-gold text-black text-xs uppercase tracking-wide font-bold py-2.5 rounded-md hover:bg-[#dbb432] transition-colors disabled:opacity-60">
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear torneo"}
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
