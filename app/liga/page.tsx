import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";
import { Users, User, BarChart2, Calendar, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

async function getLeagueData() {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) return null;

  const [standings, upcomingGames, teamCount, playerCount, topScorer] = await Promise.all([
    prisma.teamSeasonRecord.findMany({
      where: { seasonId: season.id },
      include: { team: true },
      orderBy: { standing: "asc" },
      take: 5,
    }),
    prisma.game.findMany({
      where: { seasonId: season.id, status: "SCHEDULED" },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.team.count({ where: { isActive: true } }),
    prisma.playerSeasonStats.count({ where: { seasonId: season.id } }),
    prisma.playerSeasonStats.findFirst({
      where: { seasonId: season.id },
      orderBy: { ppg: "desc" },
      include: { player: true, team: true },
    }),
  ]);

  return { season, standings, upcomingGames, teamCount, playerCount, topScorer };
}

const QUICK_LINKS = [
  { icon: Users, label: "Equipos", href: "/equipos" },
  { icon: User, label: "Jugadores", href: "/jugadores" },
  { icon: BarChart2, label: "Estadísticas", href: "/estadisticas" },
  { icon: Calendar, label: "Partidos", href: "/partidos" },
  { icon: Trophy, label: "Playoffs", href: "/playoffs" },
];

export default async function LeaguePage() {
  const data = await getLeagueData();

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/liga" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/trophy-liga.png" alt="Trofeo de la Liga" className="w-14 h-14 object-contain shrink-0" />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">
                Liga <span className="text-gold">Regular</span>
              </h1>
              <p className="text-muted text-sm mt-2">
                {data ? `${data.season.name} · ${data.teamCount} equipos · ${data.playerCount} jugadores` : "Todavía no hay ninguna temporada activa"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 text-xs uppercase tracking-wide font-bold px-3 py-2 rounded-md border border-border text-muted hover:text-gold hover:border-gold transition-colors"
              >
                <l.icon size={13} /> {l.label}
              </a>
            ))}
          </div>

          {!data ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              No hay ninguna temporada activa. Créala desde el panel de administración para empezar a ver datos aquí.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted">Clasificación</h2>
                  <a href="/clasificacion" className="text-[11px] text-gold">Ver completa</a>
                </div>
                {data.standings.length === 0 ? (
                  <p className="text-xs text-muted py-4">Todavía no hay resultados registrados esta temporada.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted text-left">
                        <th className="font-normal pb-2">Pos</th>
                        <th className="font-normal pb-2">Equipo</th>
                        <th className="font-normal pb-2 text-right">V</th>
                        <th className="font-normal pb-2 text-right">D</th>
                        <th className="font-normal pb-2 text-right">Dif</th>
                        <th className="font-normal pb-2 text-right">Racha</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {data.standings.map((s) => (
                        <tr key={s.id} className="border-t border-border">
                          <td className="py-2 text-muted">{s.standing}</td>
                          <td className="py-2 font-sans font-semibold">
                            <a href={`/equipos/${s.team.id}`} className="flex items-center gap-1.5 hover:text-gold transition-colors">
                              <TeamBadge letter={s.team.name[0]} color={s.team.primaryColor ?? "#C9A227"} /> {s.team.name}
                            </a>
                          </td>
                          <td className="py-2 text-right">{s.wins}</td>
                          <td className="py-2 text-right">{s.losses}</td>
                          <td className={`py-2 text-right ${s.pointsDiff >= 0 ? "text-win" : "text-loss"}`}>
                            {s.pointsDiff >= 0 ? "+" : ""}{s.pointsDiff}
                          </td>
                          <td className={`py-2 text-right ${s.streak?.includes("W") ? "text-win" : "text-loss"}`}>{s.streak ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-surface border border-border rounded-xl p-4">
                  <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Líder de puntos</h2>
                  {!data.topScorer ? (
                    <p className="text-xs text-muted py-4">Sin estadísticas todavía.</p>
                  ) : (
                    <a href={`/jugadores/${data.topScorer.player.id}`} className="flex items-center justify-between hover:text-gold transition-colors">
                      <div>
                        <div className="font-bold text-sm">{data.topScorer.player.gamertag}</div>
                        <div className="text-xs text-muted">{data.topScorer.team?.name ?? "Sin equipo"}</div>
                      </div>
                      <div className="font-mono font-bold text-xl text-gold">{data.topScorer.ppg}</div>
                    </a>
                  )}
                </div>

                <div className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted">Próximos partidos</h2>
                    <a href="/partidos" className="text-[11px] text-gold">Ver todos</a>
                  </div>
                  {data.upcomingGames.length === 0 ? (
                    <p className="text-xs text-muted py-4">No hay partidos programados todavía.</p>
                  ) : (
                    <div className="space-y-1">
                      {data.upcomingGames.map((g) => (
                        <div key={g.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <TeamBadge letter={g.homeTeam.name[0]} color={g.homeTeam.primaryColor ?? "#C9A227"} />
                            {g.homeTeam.name}
                            <span className="text-muted font-normal">vs</span>
                            <TeamBadge letter={g.awayTeam.name[0]} color={g.awayTeam.primaryColor ?? "#8B8B93"} />
                            {g.awayTeam.name}
                          </div>
                          <div className="text-muted font-mono text-[10px]">
                            {new Date(g.scheduledAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
