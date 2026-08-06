import type { PlayerAverages, MatchLogRow } from "@/lib/playerProfile";

export default function PlayerStatsProfile({
  averages,
  matchLog,
  emptyLabel,
}: {
  averages: PlayerAverages;
  matchLog: MatchLogRow[];
  emptyLabel: string;
}) {
  return (
    <>
      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Promedios</h2>
        {averages.gamesPlayed === 0 ? (
          <p className="text-xs text-muted py-4">{emptyLabel}</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-3 text-center">
            {[
              { label: "PJ", value: averages.gamesPlayed },
              { label: "V", value: averages.wins },
              { label: "D", value: averages.losses },
              { label: "PPG", value: averages.ppg, gold: true },
              { label: "RPG", value: averages.rpg },
              { label: "APG", value: averages.apg },
              { label: "SPG", value: averages.spg },
              { label: "BPG", value: averages.bpg },
              { label: "TC%", value: averages.fgPct ?? "—" },
              { label: "3PT%", value: averages.threePct ?? "—" },
              { label: "TL%", value: averages.ftPct ?? "—" },
            ].map((s) => (
              <div key={s.label}>
                <div className={`font-mono font-bold text-lg ${s.gold ? "text-gold" : ""}`}>{s.value}</div>
                <div className="text-[9px] text-muted uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Historial de partidos</h2>
        {matchLog.length === 0 ? (
          <p className="text-xs text-muted py-4">{emptyLabel}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted text-left">
                  <th className="font-normal pb-2 pr-3">Fecha</th>
                  <th className="font-normal pb-2 pr-3">Rival</th>
                  <th className="font-normal pb-2 pr-3">Res.</th>
                  <th className="font-normal pb-2 text-right px-1">PTS</th>
                  <th className="font-normal pb-2 text-right px-1">REB</th>
                  <th className="font-normal pb-2 text-right px-1">AST</th>
                  <th className="font-normal pb-2 text-right px-1">ROB</th>
                  <th className="font-normal pb-2 text-right px-1">TAP</th>
                  <th className="font-normal pb-2 text-right px-1">PER</th>
                  <th className="font-normal pb-2 text-right px-1">TC</th>
                  <th className="font-normal pb-2 text-right px-1">3PT</th>
                  <th className="font-normal pb-2 text-right px-1">TL</th>
                  <th className="font-normal pb-2 text-right px-1">MIN</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {matchLog.map((m) => (
                  <tr key={m.gameId} className="border-t border-border">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {m.date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="py-2 pr-3 font-sans whitespace-nowrap">vs {m.opponent}</td>
                    <td className={`py-2 pr-3 font-bold ${m.result === "W" ? "text-win" : m.result === "L" ? "text-loss" : "text-muted"}`}>
                      {m.result ?? "—"}
                    </td>
                    <td className="py-2 text-right px-1 text-gold font-bold">{m.points}</td>
                    <td className="py-2 text-right px-1">{m.rebounds}</td>
                    <td className="py-2 text-right px-1">{m.assists}</td>
                    <td className="py-2 text-right px-1">{m.steals}</td>
                    <td className="py-2 text-right px-1">{m.blocks}</td>
                    <td className="py-2 text-right px-1">{m.turnovers}</td>
                    <td className="py-2 text-right px-1">{m.fgMade}-{m.fgAttempted}</td>
                    <td className="py-2 text-right px-1">{m.threeMade}-{m.threeAttempted}</td>
                    <td className="py-2 text-right px-1">{m.ftMade}-{m.ftAttempted}</td>
                    <td className="py-2 text-right px-1">{m.minutesPlayed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
