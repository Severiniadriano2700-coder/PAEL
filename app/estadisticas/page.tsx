import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import SectionIconBadge from "@/components/SectionIconBadge";
import SeasonSelector from "@/components/SeasonSelector";
import StatsFilterForm from "@/components/StatsFilterForm";
import { computeStatLine } from "@/lib/statLine";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { key: "ppg", label: "Puntos" },
  { key: "rpg", label: "Rebotes" },
  { key: "apg", label: "Asistencias" },
  { key: "spg", label: "Robos" },
  { key: "bpg", label: "Tapones" },
  { key: "tpg", label: "Pérdidas" },
  { key: "efficiency", label: "Eficiencia" },
  { key: "astToRatio", label: "AST/PER" },
  { key: "fgPct", label: "TC%", suffix: "%" },
  { key: "threePct", label: "3PT%", suffix: "%" },
  { key: "ftPct", label: "TL%", suffix: "%" },
  { key: "doubleDoubles", label: "Dobles-dobles" },
  { key: "tripleDoubles", label: "Triples-dobles" },
  { key: "gamesPlayed", label: "Partidos" },
] as const;

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

type Row = {
  playerId: string;
  gamertag: string;
  position: string | null;
  teamId: string | null;
  teamName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  ppg: number; rpg: number; apg: number; spg: number; bpg: number; tpg: number;
  fgPct: number | null; threePct: number | null; ftPct: number | null;
  doubleDoubles: number; tripleDoubles: number;
  efficiency: number;
  astToRatio: number | null;
  // Totales (para el modo "totales" en vez de promedios)
  totals: { points: number; rebounds: number; assists: number; steals: number; blocks: number; turnovers: number };
};

async function getData(seasonId?: string) {
  const seasons = await prisma.season.findMany({ orderBy: { startDate: "desc" } });
  const season = seasonId
    ? seasons.find((s) => s.id === seasonId) ?? null
    : seasons.find((s) => s.isActive) ?? seasons[0] ?? null;

  if (!season) return { season: null, seasons, rows: [] as Row[], teams: [] };

  // Se agrega el box score real de la temporada, no la tabla de promedios:
  // así se pueden calcular métricas que no están guardadas (eficiencia,
  // dobles-dobles, ratio asistencias/pérdidas) y los totales.
  const gameStats = await prisma.playerGameStats.findMany({
    where: { game: { seasonId: season.id, status: "FINISHED" } },
    include: {
      player: true,
      team: true,
      game: { select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true } },
    },
  });

  const byPlayer = new Map<string, { player: typeof gameStats[number]["player"]; team: typeof gameStats[number]["team"]; rows: typeof gameStats; wins: number; losses: number }>();
  for (const s of gameStats) {
    const entry = byPlayer.get(s.playerId) ?? { player: s.player, team: s.team, rows: [], wins: 0, losses: 0 };
    entry.rows.push(s);
    const isHome = s.game.homeTeamId === s.teamId;
    const own = (isHome ? s.game.homeScore : s.game.awayScore) ?? 0;
    const opp = (isHome ? s.game.awayScore : s.game.homeScore) ?? 0;
    if (own > opp) entry.wins++;
    else if (own < opp) entry.losses++;
    byPlayer.set(s.playerId, entry);
  }

  const round1 = (n: number) => Math.round(n * 10) / 10;

  const rows: Row[] = [...byPlayer.entries()].map(([playerId, entry]) => {
    const line = computeStatLine(entry.rows);
    const totals = entry.rows.reduce(
      (acc, r) => ({
        points: acc.points + r.points,
        rebounds: acc.rebounds + r.rebounds,
        assists: acc.assists + r.assists,
        steals: acc.steals + r.steals,
        blocks: acc.blocks + r.blocks,
        turnovers: acc.turnovers + r.turnovers,
        fgMissed: acc.fgMissed + (r.fgAttempted - r.fgMade),
        ftMissed: acc.ftMissed + (r.ftAttempted - r.ftMade),
      }),
      { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fgMissed: 0, ftMissed: 0 }
    );

    // Eficiencia por partido (fórmula clásica de la NBA):
    // (PTS + REB + AST + ROB + TAP) − (tiros fallados + TL fallados + pérdidas)
    const gp = line.gamesPlayed || 1;
    const efficiency = round1(
      (totals.points + totals.rebounds + totals.assists + totals.steals + totals.blocks -
        totals.fgMissed - totals.ftMissed - totals.turnovers) / gp
    );

    return {
      playerId,
      gamertag: entry.player.gamertag,
      position: entry.player.position,
      teamId: entry.team?.id ?? null,
      teamName: entry.team?.name ?? "Sin equipo",
      gamesPlayed: line.gamesPlayed,
      wins: entry.wins,
      losses: entry.losses,
      ppg: line.ppg, rpg: line.rpg, apg: line.apg, spg: line.spg, bpg: line.bpg, tpg: line.tpg,
      fgPct: line.fgPct, threePct: line.threePct, ftPct: line.ftPct,
      doubleDoubles: line.doubleDoubles, tripleDoubles: line.tripleDoubles,
      efficiency,
      astToRatio: totals.turnovers ? round1(totals.assists / totals.turnovers) : null,
      totals,
    };
  });

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return { season, seasons, rows, teams };
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: { cat?: string; temporada?: string; equipo?: string; posicion?: string; modo?: string };
}) {
  const activeCat = CATEGORIES.find((c) => c.key === searchParams.cat)?.key ?? "ppg";
  const catMeta = CATEGORIES.find((c) => c.key === activeCat)!;
  const showTotals = searchParams.modo === "totales";

  const { season, seasons, rows, teams } = await getData(searchParams.temporada);

  const filtered = rows
    .filter((r) => (searchParams.equipo ? r.teamId === searchParams.equipo : true))
    .filter((r) => (searchParams.posicion ? r.position === searchParams.posicion : true))
    .sort((a, b) => ((b as any)[activeCat] ?? 0) - ((a as any)[activeCat] ?? 0));

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/estadisticas" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <SectionIconBadge icon={Activity} />
              <div>
                <h1 className="font-display uppercase text-3xl leading-none">Estadísticas</h1>
                <p className="text-muted text-sm mt-1">
                  {season ? `Líderes de ${season.name}` : "Líderes estadísticos de la liga"}
                </p>
              </div>
            </div>
            {seasons.length > 1 && season && (
              <SeasonSelector
                basePath="/estadisticas"
                seasons={seasons}
                currentId={season.id}
                extraParams={{ cat: activeCat, equipo: searchParams.equipo, posicion: searchParams.posicion, modo: searchParams.modo }}
              />
            )}
          </div>

          {!season ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              No hay ninguna temporada creada todavía.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CATEGORIES.map((c) => {
                  const params = new URLSearchParams();
                  params.set("cat", c.key);
                  if (searchParams.temporada) params.set("temporada", searchParams.temporada);
                  if (searchParams.equipo) params.set("equipo", searchParams.equipo);
                  if (searchParams.posicion) params.set("posicion", searchParams.posicion);
                  if (searchParams.modo) params.set("modo", searchParams.modo);
                  return (
                    <a
                      key={c.key}
                      href={`/estadisticas?${params.toString()}`}
                      className={`text-[10px] uppercase tracking-wide font-bold px-2.5 py-1.5 rounded-md border transition-colors ${
                        activeCat === c.key ? "border-gold text-gold bg-gold/10" : "border-border text-muted hover:text-white"
                      }`}
                    >
                      {c.label}
                    </a>
                  );
                })}
              </div>

              <StatsFilterForm
                teams={teams}
                positions={POSITIONS}
                cat={activeCat}
                temporada={searchParams.temporada}
                equipo={searchParams.equipo}
                posicion={searchParams.posicion}
                modo={searchParams.modo}
              />

              <div className="bg-surface border border-border rounded-xl p-4">
                {filtered.length === 0 ? (
                  <p className="text-xs text-muted py-8 text-center">
                    No hay estadísticas que coincidan con los filtros.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted text-left text-xs">
                          <th className="font-normal pb-3">#</th>
                          <th className="font-normal pb-3">Jugador</th>
                          <th className="font-normal pb-3">Pos</th>
                          <th className="font-normal pb-3">Equipo</th>
                          <th className="font-normal pb-3 text-right">PJ</th>
                          <th className="font-normal pb-3 text-right">V-D</th>
                          <th className="font-normal pb-3 text-right">{catMeta.label}</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {filtered.map((r, i) => {
                          const value = (r as any)[activeCat];
                          const totalMap: Record<string, number | undefined> = {
                            ppg: r.totals.points, rpg: r.totals.rebounds, apg: r.totals.assists,
                            spg: r.totals.steals, bpg: r.totals.blocks, tpg: r.totals.turnovers,
                          };
                          const displayValue =
                            showTotals && totalMap[activeCat] !== undefined
                              ? totalMap[activeCat]
                              : value ?? "—";
                          return (
                            <tr key={r.playerId} className="border-t border-border">
                              <td className="py-2.5 text-muted">{i + 1}</td>
                              <td className="py-2.5 font-sans font-semibold">
                                <a href={`/jugadores/${r.playerId}`} className="hover:text-gold transition-colors">
                                  {r.gamertag}
                                </a>
                              </td>
                              <td className="py-2.5 text-muted">{r.position ?? "—"}</td>
                              <td className="py-2.5 font-sans text-muted">{r.teamName}</td>
                              <td className="py-2.5 text-right">{r.gamesPlayed}</td>
                              <td className="py-2.5 text-right text-muted">{r.wins}-{r.losses}</td>
                              <td className="py-2.5 text-right text-gold font-bold">
                                {displayValue}
                                {!showTotals && (catMeta as any).suffix ? (catMeta as any).suffix : ""}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
