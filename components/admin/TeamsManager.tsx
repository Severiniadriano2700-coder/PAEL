"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type Team = {
  id: string;
  name: string;
  shortName: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  isActive: boolean;
};

type FormState = {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  shortName: "",
  primaryColor: "#C9A227",
  secondaryColor: "",
  logoUrl: "",
};

export default function TeamsManager({ initialTeams }: { initialTeams: Team[] }) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);
  const [editing, setEditing] = useState<Team | null>(null);
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

  function openEdit(team: Team) {
    setEditing(team);
    setForm({
      name: team.name,
      shortName: team.shortName ?? "",
      primaryColor: team.primaryColor ?? "#C9A227",
      secondaryColor: team.secondaryColor ?? "",
      logoUrl: team.logoUrl ?? "",
    });
    setError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre del equipo es obligatorio.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const url = editing ? `/api/admin/equipos/${editing.id}` : "/api/admin/equipos";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el equipo.");

      if (editing) {
        setTeams((prev) => prev.map((t) => (t.id === editing.id ? data.team : t)));
      } else {
        setTeams((prev) => [...prev, data.team].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(team: Team) {
    const res = await fetch(`/api/admin/equipos/${team.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !team.isActive }),
    });
    const data = await res.json();
    if (res.ok) {
      setTeams((prev) => prev.map((t) => (t.id === team.id ? data.team : t)));
      router.refresh();
    }
  }

  async function handleDelete(team: Team) {
    setDeleteError(null);
    if (!confirm(`¿Eliminar definitivamente "${team.name}"? Esta acción no se puede deshacer.`)) return;

    setDeletingId(team.id);
    try {
      const res = await fetch(`/api/admin/equipos/${team.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar el equipo.");
      setTeams((prev) => prev.filter((t) => t.id !== team.id));
      router.refresh();
    } catch (err: any) {
      setDeleteError({ id: team.id, message: err.message });
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
          <Plus size={14} /> Nuevo equipo
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        {teams.length === 0 ? (
          <p className="text-xs text-muted py-8 text-center">Todavía no hay equipos creados.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted text-left">
                <th className="font-normal pb-2">Equipo</th>
                <th className="font-normal pb-2">Siglas</th>
                <th className="font-normal pb-2">Color</th>
                <th className="font-normal pb-2">Estado</th>
                <th className="font-normal pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-t border-border">
                  <td className="py-2.5 font-sans font-semibold">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                        style={{
                          backgroundColor: "#151417",
                          color: team.primaryColor ?? "#C9A227",
                          border: `1px solid ${(team.primaryColor ?? "#C9A227")}40`,
                        }}
                      >
                        {team.name[0]}
                      </span>
                      {team.name}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted font-mono">{team.shortName ?? "—"}</td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-muted font-mono">
                      <span
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: team.primaryColor ?? "#2A2A2E" }}
                      />
                      {team.primaryColor ?? "—"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <button
                      onClick={() => handleToggleActive(team)}
                      className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded ${
                        team.isActive ? "text-win border border-win/40" : "text-muted border border-border"
                      }`}
                    >
                      {team.isActive ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(team)}
                        className="p-1.5 rounded-md border border-border text-muted hover:text-gold hover:border-gold transition-colors"
                        title="Editar"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(team)}
                        disabled={deletingId === team.id}
                        className="p-1.5 rounded-md border border-border text-muted hover:text-loss hover:border-loss transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {deleteError?.id === team.id && (
                      <p className="text-loss text-[10px] mt-1.5 text-right max-w-[220px] ml-auto">
                        {deleteError.message}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display uppercase text-xl">
                {editing ? "Editar equipo" : "Nuevo equipo"}
              </h2>
              <button onClick={closeModal} className="text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <FormField
                label="Nombre"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="ej. Wolves"
              />
              <FormField
                label="Siglas"
                value={form.shortName}
                onChange={(v) => setForm((f) => ({ ...f, shortName: v }))}
                placeholder="ej. WOL"
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Color primario"
                  value={form.primaryColor}
                  onChange={(v) => setForm((f) => ({ ...f, primaryColor: v }))}
                  placeholder="#C9A227"
                />
                <FormField
                  label="Color secundario"
                  value={form.secondaryColor}
                  onChange={(v) => setForm((f) => ({ ...f, secondaryColor: v }))}
                  placeholder="#000000"
                />
              </div>
              <FormField
                label="URL del logo (opcional)"
                value={form.logoUrl}
                onChange={(v) => setForm((f) => ({ ...f, logoUrl: v }))}
                placeholder="https://..."
              />

              {error && (
                <p className="text-xs text-loss border border-loss/40 bg-loss/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-border text-muted text-xs uppercase tracking-wide font-bold py-2.5 rounded-md hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gold text-black text-xs uppercase tracking-wide font-bold py-2.5 rounded-md hover:bg-[#dbb432] transition-colors disabled:opacity-60"
                >
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear equipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
      />
    </div>
  );
}
