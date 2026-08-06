"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";

type VoteCount = { playerId: string; gamertag: string; votes: number };

type Competition = {
  key: string;
  label: string;
  seasonId: string | null;
  tournamentId: string | null;
  counts: VoteCount[];
  alreadyAwarded: boolean;
};

export default function MvpVotingManager({ competitions }: { competitions: Competition[] }) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);

  async function handleClose(comp: Competition, playerId: string) {
    if (!confirm("¿Cerrar la votación y otorgar el premio de MVP a este jugador? No se puede deshacer.")) return;
    setBusyKey(comp.key);
    setError(null);
    try {
      const res = await fetch("/api/admin/mvp/cerrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasonId: comp.seasonId, tournamentId: comp.tournamentId, playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cerrar la votación.");
      router.refresh();
    } catch (err: any) {
      setError({ key: comp.key, message: err.message });
    } finally {
      setBusyKey(null);
    }
  }

  if (competitions.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted text-sm">
        Todavía no hay votos registrados en ninguna competición.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {competitions.map((comp) => {
        const totalVotes = comp.counts.reduce((sum, c) => sum + c.votes, 0);
        const leader = comp.counts[0];
        return (
          <div key={comp.key} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted">{comp.label}</h2>
              <span className="text-[10px] text-muted">{totalVotes} voto{totalVotes !== 1 ? "s" : ""}</span>
            </div>

            {comp.alreadyAwarded ? (
              <p className="text-xs text-win flex items-center gap-1.5">
                <Trophy size={13} /> MVP ya otorgado para esta competición.
              </p>
            ) : comp.counts.length === 0 ? (
              <p className="text-xs text-muted py-2">Sin votos todavía.</p>
            ) : (
              <div className="space-y-1.5">
                {comp.counts.map((c) => (
                  <div key={c.playerId} className="flex items-center justify-between text-sm border-t border-border pt-1.5 first:border-0 first:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{c.gamertag}</span>
                      {c.playerId === leader?.playerId && (
                        <span className="text-[9px] uppercase font-bold text-gold border border-gold/40 rounded px-1.5 py-0.5">Líder</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-muted">{c.votes}</span>
                      <button
                        onClick={() => handleClose(comp, c.playerId)}
                        disabled={busyKey === comp.key}
                        className="text-[10px] uppercase tracking-wide font-bold text-gold border border-gold/40 rounded px-2 py-1 hover:bg-gold/10 transition-colors disabled:opacity-60"
                      >
                        Otorgar MVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {error?.key === comp.key && <p className="text-loss text-[11px] mt-2">{error.message}</p>}
          </div>
        );
      })}
    </div>
  );
}
