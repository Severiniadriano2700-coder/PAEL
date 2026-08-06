"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

type Player = {
  id: string;
  gamertag: string;
  fullName: string | null;
  position: string | null;
  bio: string | null;
  avatarUrl: string | null;
  twitter: string | null;
  twitch: string | null;
  youtube: string | null;
  isActive: boolean;
  currentTeamId: string | null;
};

type Team = { id: string; name: string };

type FormState = {
  gamertag: string;
  fullName: string;
  position: string;
  bio: string;
  avatarUrl: string;
  twitter: string;
  twitch: string;
  youtube: string;
  teamId: string;
};

const EMPTY_FORM: FormState = {
  gamertag: "",
  fullName: "",
  position: "",
  bio: "",
  avatarUrl: "",
  twitter: "",
  twitch: "",
  youtube: "",
  teamId: "",
};

export default function PlayersManager({
  initialPlayers,
  teams,
}: {
  initialPlayers: Player[];
  teams: Team[];
}) {
  const router = useRouter();
  const [players, setPlayers] = useState(initialPlayers);
  const [editing, setEditing] = useState<Player | null>(null);
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

  function openEdit(player: Player) {
    setEditing(player);
    setForm({
      gamertag: player.gamertag,
      fullName: player.fullName ?? "",
      position: player.position ?? "",
      bio: player.bio ?? "",
      avatarUrl: player.avatarUrl ?? "",
      twitter: player.twitter ?? "",
      twitch: player.twitch ?? "",
      youtube: player.youtube ?? "",
      teamId: player.currentTeamId ?? "",
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
    if (!form.gamertag.trim()) {
      setError("El gamertag es obligatorio.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const url = editing ? `/api/admin/jugadores/${editing.id}` : "/api/admin/jugadores";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, teamId: form.teamId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el jugador.");

      const teamName = teams.find((t) => t.id === form.teamId)?.name ?? null;
      const updated: Player = { ...data.player, currentTeamId: form.teamId || null };

      if (editing) {
        setPlayers((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
      } else {
        setPlayers((prev) => [...prev, updated].sort((a, b) => a.gamertag.localeCompare(b.gamertag)));
      }
      void teamName;
      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(player: Player) {
    const res = await fetch(`/api/admin/jugadores/${player.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !player.isActive }),
    });
    const data = await res.json();
    if (res.ok) {
      setPlayers((prev) => prev.map((p) => (p.id === player.id ? { ...p, isActive: data.player.isActive } : p)));
      router.refresh();
    }
  }

  async function handleDelete(player: Player) {
    setDeleteError(null);
    if (!confirm(`¿Eliminar definitivamente a "${player.gamertag}"? Esta acción no se puede deshacer.`)) return;

    setDeletingId(player.id);
    try {
      const res = await fetch(`/api/admin/jugadores/${player.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar el jugador.");
      setPlayers((prev) => prev.filter((p) => p.id !== player.id));
      router.refresh();
    } catch (err: any) {
      setDeleteError({ id: player.id, message: err.message });
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
          <Plus size={14} /> Nuevo jugador
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        {players.length === 0 ? (
          <p className="text-xs text-muted py-8 text-center">Todavía no hay jugadores creados.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted text-left">
                <th className="font-normal pb-2">Gamertag</th>
                <th className="font-normal pb-2">Pos</th>
                <th className="font-normal pb-2">Equipo</th>
                <th className="font-normal pb-2">Estado</th>
                <th className="font-normal pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-t border-border">
                  <td className="py-2.5 font-sans font-semibold">{player.gamertag}</td>
                  <td className="py-2.5 text-muted font-mono">{player.position ?? "—"}</td>
                  <td className="py-2.5 text-muted">
                    {teams.find((t) => t.id === player.currentTeamId)?.name ?? "Sin equipo"}
                  </td>
                  <td className="py-2.5">
                    <button
                      onClick={() => handleToggleActive(player)}
                      className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded ${
                        player.isActive ? "text-win border border-win/40" : "text-muted border border-border"
                      }`}
                    >
                      {player.isActive ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(player)}
                        className="p-1.5 rounded-md border border-border text-muted hover:text-gold hover:border-gold transition-colors"
                        title="Editar"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(player)}
                        disabled={deletingId === player.id}
                        className="p-1.5 rounded-md border border-border text-muted hover:text-loss hover:border-loss transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {deleteError?.id === player.id && (
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display uppercase text-xl">
                {editing ? "Editar jugador" : "Nuevo jugador"}
              </h2>
              <button onClick={closeModal} className="text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <FormField
                label="Gamertag"
                value={form.gamertag}
                onChange={(v) => setForm((f) => ({ ...f, gamertag: v }))}
                placeholder="ej. A. Severini"
              />
              <FormField
                label="Nombre completo (opcional)"
                value={form.fullName}
                onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
                placeholder="ej. Adriano Severini"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
                    Posición
                  </label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">—</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
                    Equipo (temporada activa)
                  </label>
                  <select
                    value={form.teamId}
                    onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))}
                    className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Sin equipo</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <FormField
                label="Bio (opcional)"
                value={form.bio}
                onChange={(v) => setForm((f) => ({ ...f, bio: v }))}
                placeholder="Breve descripción del jugador"
              />
              <FormField
                label="URL de avatar / captura 2K27 (opcional)"
                value={form.avatarUrl}
                onChange={(v) => setForm((f) => ({ ...f, avatarUrl: v }))}
                placeholder="https://..."
              />
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Twitter" value={form.twitter} onChange={(v) => setForm((f) => ({ ...f, twitter: v }))} placeholder="@usuario" />
                <FormField label="Twitch" value={form.twitch} onChange={(v) => setForm((f) => ({ ...f, twitch: v }))} placeholder="usuario" />
                <FormField label="YouTube" value={form.youtube} onChange={(v) => setForm((f) => ({ ...f, youtube: v }))} placeholder="canal" />
              </div>

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
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear jugador"}
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
