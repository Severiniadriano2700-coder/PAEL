"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RosterPlayer = { playerId: string; gamertag: string };
type TeamInfo = { id: string; name: string; roster: RosterPlayer[] };
type ExistingStat = {
  playerId: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutesPlayed: number;
  fgMade: number;
  fgAttempted: number;
  threeMade: number;
  threeAttempted: number;
  ftMade: number;
  ftAttempted: number;
};

type StatRow = {
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutesPlayed: number;
  fgMade: number;
  fgAttempted: number;
  threeMade: number;
  threeAttempted: number;
  ftMade: number;
  ftAttempted: number;
};

const EMPTY_STAT: StatRow = {
  points: 0, assists: 0, rebounds: 0, steals: 0, blocks: 0, turnovers: 0, minutesPlayed: 0,
  fgMade: 0, fgAttempted: 0, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0,
};

const FIELDS: { key: keyof StatRow; label: string }[] = [
  { key: "points", label: "PTS" },
  { key: "rebounds", label: "REB" },
  { key: "assists", label: "AST" },
  { key: "steals", label: "ROB" },
  { key: "blocks", label: "TAP" },
  { key: "turnovers", label: "PER" },
  { key: "minutesPlayed", label: "MIN" },
  { key: "fgMade", label: "TC-A" },
  { key: "fgAttempted", label: "TC-I" },
  { key: "threeMade", label: "3P-A" },
  { key: "threeAttempted", label: "3P-I" },
  { key: "ftMade", label: "TL-A" },
  { key: "ftAttempted", label: "TL-I" },
];

export default function GameResultForm({
  gameId,
  homeTeam,
  awayTeam,
  initialHomeScore,
  initialAwayScore,
  existingStats,
}: {
  gameId: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  initialHomeScore: number | null;
  initialAwayScore: number | null;
  existingStats: ExistingStat[];
}) {
  const router = useRouter();
  const [homeScore, setHomeScore] = useState(initialHomeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(initialAwayScore?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [stats, setStats] = useState<Record<string, StatRow>>(() => {
    const initial: Record<string, StatRow> = {};
    for (const p of [...homeTeam.roster, ...awayTeam.roster]) {
      const existing = existingStats.find((s) => s.playerId === p.playerId);
      initial[p.playerId] = existing
        ? {
            points: existing.points,
            assists: existing.assists,
            rebounds: existing.rebounds,
            steals: existing.steals,
            blocks: existing.blocks,
            turnovers: existing.turnovers,
            minutesPlayed: existing.minutesPlayed,
            fgMade: existing.fgMade,
            fgAttempted: existing.fgAttempted,
            threeMade: existing.threeMade,
            threeAttempted: existing.threeAttempted,
            ftMade: existing.ftMade,
            ftAttempted: existing.ftAttempted,
          }
        : { ...EMPTY_STAT };
    }
    return initial;
  });

  function updateStat(playerId: string, field: keyof StatRow, value: string) {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setStats((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [field]: num } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const hs = parseInt(homeScore, 10);
    const as = parseInt(awayScore, 10);
    if (isNaN(hs) || isNaN(as) || hs < 0 || as < 0) {
      setError("Introduce un marcador válido para ambos equipos.");
      return;
    }

    const boxScore = [
      ...homeTeam.roster.map((p) => ({ playerId: p.playerId, teamId: homeTeam.id, ...stats[p.playerId] })),
      ...awayTeam.roster.map((p) => ({ playerId: p.playerId, teamId: awayTeam.id, ...stats[p.playerId] })),
    ];

    for (const row of boxScore) {
      const gamertag = homeTeam.roster.concat(awayTeam.roster).find((p) => p.playerId === row.playerId)?.gamertag;
      if (row.fgMade > row.fgAttempted) {
        setError(`${gamertag}: tiros de campo anotados no puede ser mayor que intentados.`);
        return;
      }
      if (row.threeMade > row.threeAttempted) {
        setError(`${gamertag}: triples anotados no puede ser mayor que intentados.`);
        return;
      }
      if (row.ftMade > row.ftAttempted) {
        setError(`${gamertag}: tiros libres anotados no puede ser mayor que intentados.`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/partidos/${gameId}/resultado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore: hs, awayScore: as, boxScore }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el resultado.");
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Marcador */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-center gap-6">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-wider font-bold text-muted mb-2">{homeTeam.name}</div>
          <input
            type="number"
            min={0}
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-20 text-center bg-black border border-border rounded-md px-2 py-2 text-2xl font-mono font-bold focus:outline-none focus:border-gold"
          />
        </div>
        <div className="text-muted text-xl font-display">VS</div>
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-wider font-bold text-muted mb-2">{awayTeam.name}</div>
          <input
            type="number"
            min={0}
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-20 text-center bg-black border border-border rounded-md px-2 py-2 text-2xl font-mono font-bold focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Box score por equipo */}
      {[homeTeam, awayTeam].map((team) => (
        <div key={team.id} className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">{team.name} — estadísticas</h2>
          {team.roster.length === 0 ? (
            <p className="text-xs text-muted py-4">Este equipo no tiene jugadores asignados todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted text-left">
                    <th className="font-normal pb-2 pr-2">Jugador</th>
                    {FIELDS.map((f) => (
                      <th key={f.key} className="font-normal pb-2 px-1 text-center">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {team.roster.map((p) => (
                    <tr key={p.playerId} className="border-t border-border">
                      <td className="py-1.5 pr-2 font-sans font-semibold whitespace-nowrap">{p.gamertag}</td>
                      {FIELDS.map((f) => (
                        <td key={f.key} className="py-1.5 px-1">
                          <input
                            type="number"
                            min={0}
                            value={stats[p.playerId]?.[f.key] ?? 0}
                            onChange={(e) => updateStat(p.playerId, f.key, e.target.value)}
                            className="w-12 text-center bg-black border border-border rounded px-1 py-1 focus:outline-none focus:border-gold"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {error && (
        <p className="text-xs text-loss border border-loss/40 bg-loss/10 rounded-md px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-xs text-win border border-win/40 bg-win/10 rounded-md px-3 py-2">
          Resultado guardado. Los promedios y estadísticas se han actualizado.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-gold text-black text-xs uppercase tracking-wide font-bold py-3 rounded-md hover:bg-[#dbb432] transition-colors disabled:opacity-60"
      >
        {saving ? "Guardando..." : "Guardar resultado"}
      </button>
    </form>
  );
}
