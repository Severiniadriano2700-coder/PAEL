"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, ClipboardList } from "lucide-react";

type Team = { id: string; name: string };

type Game = {
  id: string;
  scheduledAt: string;
  status: string;
  phase: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: Team;
  awayTeam: Team;
};

type FormState = {
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string;
  phase: string;
};

const EMPTY_FORM: FormState = { homeTeamId: "", awayTeamId: "", scheduledAt: "", phase: "REGULAR" };

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Programado",
  LIVE: "En vivo",
  FINISHED: "Finalizado",
  POSTPONED: "Aplazado",
  CANCELLED: "Cancelado",
};

export default function GamesManager({
  initialGames,
  teams,
  activeSeasonId,
}: {
  initialGames: Game[];
  teams: Team[];
  activeSeasonId: string | null;
}) {
  const router = useRouter();
  const [games, setGames] = useState(initialGames);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  function openCreate() {
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.homeTeamId || !form.awayTeamId || !form.scheduledAt) {
      setError("Completa equipo local, visitante y fecha.");
      return;
    }
    if (form.homeTeamId === form.awayTeamId) {
      setError("El equipo local y visitante no pueden ser el mismo.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/partidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, seasonId: activeSeasonId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el partido.");

      setGames((prev) =>
        [...prev, data.game].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      );
      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(game: Game) {
    setDeleteError(null);
    if (!confirm(`¿Eliminar el partido ${game.homeTeam.name} vs ${game.awayTeam.name}?`)) return;

    setDeletingId(game.id);
    try {
      const res = await fetch(`/api/admin/partidos/${game.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar el partido.");
      setGames((prev) => prev.filter((g) => g.id !== game.id));
      router.refresh();
    } catch (err: any) {
      setDeleteError({ id: game.id, message: err.message });
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
          <Plus size={14} /> Programar partido
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        {games.length === 0 ? (
          <p className="text-xs text-muted py-8 text-center">Todavía no hay partidos programados.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted text-left">
                <th className="font-normal pb-2">Fecha</th>
                <th className="font-normal pb-2">Partido</th>
                <th className="font-normal pb-2">Fase</th>
                <th className="font-normal pb-2">Estado</th>
                <th className="font-normal pb-2">Marcador</th>
                <th className="font-normal pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="border-t border-border">
                  <td className="py-2.5 font-mono text-muted whitespace-nowrap">
                    {new Date(game.scheduledAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}{" "}
                    {new Date(game.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-2.5 font-sans font-semibold whitespace-nowrap">
                    {game.homeTeam.name} <span className="text-muted font-normal">vs</span> {game.awayTeam.name}
                  </td>
                  <td className="py-2.5 text-muted">{game.phase}</td>
                  <td className="py-2.5">
                    <span
                      className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded border ${
                        game.status === "FINISHED"
                          ? "text-win border-win/40"
                          : game.status === "CANCELLED" || game.status === "POSTPONED"
                          ? "text-loss border-loss/40"
                          : "text-muted border-border"
                      }`}
                    >
                      {STATUS_LABEL[game.status] ?? game.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono">
                    {game.homeScore !== null && game.awayScore !== null ? `${game.homeScore} - ${game.awayScore}` : "—"}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/admin/partidos/${game.id}`}
                        className="flex items-center gap-1 p-1.5 rounded-md border border-border text-muted hover:text-gold hover:border-gold transition-colors text-[10px] uppercase font-bold px-2"
                        title="Registrar resultado"
                      >
                        <ClipboardList size={13} /> {game.status === "FINISHED" ? "Editar" : "Resultado"}
                      </a>
                      {game.status !== "FINISHED" && (
                        <button
                          onClick={() => handleDelete(game)}
                          disabled={deletingId === game.id}
                          className="p-1.5 rounded-md border border-border text-muted hover:text-loss hover:border-loss transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    {deleteError?.id === game.id && (
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
              <h2 className="font-display uppercase text-xl">Programar partido</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
                    Equipo local
                  </label>
                  <select
                    value={form.homeTeamId}
                    onChange={(e) => setForm((f) => ({ ...f, homeTeamId: e.target.value }))}
                    className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Selecciona...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
                    Equipo visitante
                  </label>
                  <select
                    value={form.awayTeamId}
                    onChange={(e) => setForm((f) => ({ ...f, awayTeamId: e.target.value }))}
                    className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Selecciona...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
                  Fecha y hora
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
                  Fase
                </label>
                <select
                  value={form.phase}
                  onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value }))}
                  className="w-full bg-black border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="REGULAR">Temporada regular</option>
                  <option value="PLAYOFFS">Playoffs</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>

              {error && (
                <p className="text-xs text-loss border border-loss/40 bg-loss/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-border text-muted text-xs uppercase tracking-wide font-bold py-2.5 rounded-md hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gold text-black text-xs uppercase tracking-wide font-bold py-2.5 rounded-md hover:bg-[#dbb432] transition-colors disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Programar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
