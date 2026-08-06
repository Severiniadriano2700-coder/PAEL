import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

async function getTeam(id: string) {
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return null;

  const activeSeason = await prisma.season.findFirst({ where: { isActive: true } });

  const [currentRecord, roster, seasonHistory, upcomingGames] = await Promise.all([
    activeSeason
      ? prisma.teamSeasonRecord.findUnique({
          where: { teamId_seasonId: { teamId: team.id, seasonId: activeSeason.id } },
        })
      : null,
    activeSeason
      ? prisma.playerSeasonStats.findMany({
          where: { teamId: team.id, seasonId: activeSeason.id },
          include: { player: true },
          orderBy: { ppg: "desc" },
        })
      : [],
    prisma.teamSeasonRecord.findMany({
      where: { teamId: team.id },
      include: { season: true },
      orderBy: { season: { startDate: "desc" } },
    }),
    prisma.game.findMany({
      where: {
        status: "SCHEDULED",
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
      },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
  ]);

  return { team, activeSeason, currentRecord, roster, seasonHistory, upcomingGames };
}

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const data = await getTeam(params.id);
  if (!data) notFound();

  const { team, currentRecord, roster, seasonHistory, upcomingGames } = data;

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/equipos" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          {/* Header */}
          <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shrink-0"
              style={{
                backgroundColor: "#151417",
                color: team.primaryColor ?? "#C9A227",
                border: `1px solid ${(team.primaryColor ?? "#C9A227")}40`,
              }}
            >
              {team.name[0]}
            </div>
            <div className="flex-1">
              <h1 className="font-display uppercase text-3xl leading-none">{team.name}</h1>
              <div className="text-xs text-muted mt-1">
                {team.shortName ?? "—"} · Fundado en {new Date(team.foundedAt).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
              </div>
            </div>
            {currentRecord ? (
              <div className="text-right">
                <div className="font-mono font-bold text-2xl">
                  {currentRecord.wins}V - {currentRecord.losses}D
                </div>
                <div className="text-[10px] text-muted uppercase tracking-wide">
                  {currentRecord.standing ? `Posición #${currentRecord.standing}` : "Sin clasificar"}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted">Sin partidos esta temporada</div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Roster */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-4">
              <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Plantilla actual</h2>
              {roster.length === 0 ? (
                <p className="text-xs text-muted py-4">Todavía no hay jugadores asignados a este equipo esta temporada.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted text-left">
                      <th className="font-normal pb-2">Jugador</th>
                      <th className="font-normal pb-2">Pos</th>
                      <th className="font-normal pb-2 text-right">PPG</th>
                      <th className="font-normal pb-2 text-right">RPG</th>
                      <th className="font-normal pb-2 text-right">APG</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {roster.map((s) => (
                      <tr key={s.id} className="border-t border-border">
                        <td className="py-2 font-sans font-semibold">
                          <a href={`/jugadores/${s.player.id}`} className="hover:text-gold transition-colors">
                            {s.player.gamertag}
                          </a>
                        </td>
                        <td className="py-2 text-muted">{s.player.position ?? "—"}</td>
                        <td className="py-2 text-right text-gold">{s.ppg}</td>
                        <td className="py-2 text-right">{s.rpg}</td>
                        <td className="py-2 text-right">{s.apg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Próximos partidos */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Próximos partidos</h2>
              {upcomingGames.length === 0 ? (
                <p className="text-xs text-muted py-4">No hay partidos programados todavía.</p>
              ) : (
                <div className="space-y-1">
                  {upcomingGames.map((g) => (
                    <div key={g.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <TeamBadge letter={g.homeTeam.name[0]} color={g.homeTeam.primaryColor ?? "#C9A227"} />
                        <span className="text-muted font-normal">vs</span>
                        <TeamBadge letter={g.awayTeam.name[0]} color={g.awayTeam.primaryColor ?? "#8B8B93"} />
                      </div>
                      <div className="text-right leading-tight">
                        <div className="text-[10px] font-mono text-muted">
                          {new Date(g.scheduledAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                        </div>
                        <div className="text-[10px] font-mono text-muted">
                          {new Date(g.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historial de temporadas */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Historial de temporadas</h2>
            {seasonHistory.length === 0 ? (
              <p className="text-xs text-muted py-4">Este equipo todavía no tiene historial de temporadas.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted text-left">
                    <th className="font-normal pb-2">Temporada</th>
                    <th className="font-normal pb-2 text-right">V</th>
                    <th className="font-normal pb-2 text-right">D</th>
                    <th className="font-normal pb-2 text-right">Dif</th>
                    <th className="font-normal pb-2 text-right">Posición</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {seasonHistory.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="py-2 font-sans font-semibold">{r.season.name}</td>
                      <td className="py-2 text-right">{r.wins}</td>
                      <td className="py-2 text-right">{r.losses}</td>
                      <td className={`py-2 text-right ${r.pointsDiff >= 0 ? "text-win" : "text-loss"}`}>
                        {r.pointsDiff >= 0 ? "+" : ""}{r.pointsDiff}
                      </td>
                      <td className="py-2 text-right text-muted">{r.standing ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
