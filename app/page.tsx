import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";
import { Image as ImageIcon } from "lucide-react";

// Esta página se vuelve a generar en cada visita para que los datos
// siempre estén al día (nada de caché estática mientras la liga está activa).
export const dynamic = "force-dynamic";

async function getHomeData() {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) return null;

  const [upcomingGames, standings, news] = await Promise.all([
    prisma.game.findMany({
      where: { seasonId: season.id, status: "SCHEDULED" },
      orderBy: { scheduledAt: "asc" },
      take: 4,
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.teamSeasonRecord.findMany({
      where: { seasonId: season.id },
      orderBy: { standing: "asc" },
      take: 5,
      include: { team: true },
    }),
    prisma.news.findMany({ orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  const recentResults = await prisma.game.findMany({
    where: { seasonId: season.id, status: "FINISHED" },
    orderBy: { scheduledAt: "desc" },
    take: 4,
    include: { homeTeam: true, awayTeam: true },
  });

  // Jugador destacado: el líder de puntos por partido de la temporada activa
  const featuredStats = await prisma.playerSeasonStats.findFirst({
    where: { seasonId: season.id },
    orderBy: { ppg: "desc" },
    include: { player: true, team: true },
  });

  // Líderes estadísticos: uno por categoría
  const [topScorer, topAssists, topRebounds, topSteals] = await Promise.all([
    prisma.playerSeasonStats.findFirst({ where: { seasonId: season.id }, orderBy: { ppg: "desc" }, include: { player: true, team: true } }),
    prisma.playerSeasonStats.findFirst({ where: { seasonId: season.id }, orderBy: { apg: "desc" }, include: { player: true, team: true } }),
    prisma.playerSeasonStats.findFirst({ where: { seasonId: season.id }, orderBy: { rpg: "desc" }, include: { player: true, team: true } }),
    prisma.playerSeasonStats.findFirst({ where: { seasonId: season.id }, orderBy: { spg: "desc" }, include: { player: true, team: true } }),
  ]);

  return { season, upcomingGames, recentResults, standings, news, featuredStats, leaders: { topScorer, topAssists, topRebounds, topSteals } };
}

// El banner de torneo se muestra siempre, incluso sin temporada de liga
// activa, así que se consulta aparte: primero un torneo en curso y, si no
// hay, el siguiente próximo por fecha.
async function getFeaturedTournament() {
  const ongoing = await prisma.tournament.findFirst({
    where: { status: "ONGOING" },
    orderBy: { startDate: "asc" },
  });
  if (ongoing) return ongoing;

  return prisma.tournament.findFirst({
    where: { status: "UPCOMING" },
    orderBy: { startDate: "asc" },
  });
}

export default async function Home() {
  const [data, featuredTournament] = await Promise.all([getHomeData(), getFeaturedTournament()]);

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />

        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface min-h-[220px] flex items-center">
            <div className="relative z-10 px-8 py-10">
              <h1 className="text-5xl md:text-6xl font-display uppercase leading-none">
                ProAm Elite <span className="text-gold">League</span>
              </h1>
              <p className="mt-3 text-muted uppercase text-xs tracking-[0.25em] font-medium">
                Where competition meets legacy
              </p>
              <a
                href="/partidos"
                className="inline-block mt-6 bg-gold text-black font-bold text-xs uppercase tracking-wide px-5 py-3 rounded-md hover:bg-[#dbb432] transition-colors"
              >
                Ver calendario de partidos
              </a>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[50%] hidden md:flex items-center justify-center gap-2 bg-gradient-to-l from-[#0D0D0F] to-transparent">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/trophy-liga.png"
                alt="Trofeo de la Liga"
                className="h-44 w-auto object-contain drop-shadow-[0_0_30px_rgba(201,162,39,0.25)]"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/trophy-torneo.png"
                alt="Trofeo del Torneo"
                className="h-44 w-auto object-contain drop-shadow-[0_0_30px_rgba(201,162,39,0.25)]"
              />
            </div>
          </div>

          {!data ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              No hay ninguna temporada activa todavía. Crea una temporada y márcala como activa desde el panel de administración para que el home empiece a mostrar datos.
            </div>
          ) : (
            <>
              {/* Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Próximos partidos */}
                <div className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted">Próximos partidos</h2>
                    <a href="/partidos" className="text-[11px] text-gold">Ver calendario</a>
                  </div>
                  {data.upcomingGames.length === 0 ? (
                    <p className="text-xs text-muted py-4">No hay partidos programados todavía.</p>
                  ) : (
                    <div className="space-y-1">
                      {data.upcomingGames.map((g) => (
                        <div key={g.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <TeamBadge logoUrl={g.homeTeam.logoUrl} letter={g.homeTeam.name[0]} />
                            {g.homeTeam.name}
                            <span className="text-muted font-normal text-xs">x</span>
                            <TeamBadge logoUrl={g.awayTeam.logoUrl} letter={g.awayTeam.name[0]} color="#8B8B93" />
                            {g.awayTeam.name}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right leading-tight">
                              <div className="text-[10px] font-mono text-muted">
                                {new Date(g.scheduledAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                              </div>
                              <div className="text-[10px] font-mono text-muted">
                                {new Date(g.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                            <button className="text-[10px] font-bold uppercase border border-[#2A2A2E] rounded px-2 py-1 text-gold">Ver</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clasificación */}
                <div className="bg-surface border border-border rounded-xl p-4">
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
                              <span className="flex items-center gap-1.5">
                                <TeamBadge logoUrl={s.team.logoUrl} letter={s.team.name[0]} /> {s.team.name}
                              </span>
                            </td>
                            <td className="py-2 text-right">{s.wins}</td>
                            <td className="py-2 text-right">{s.losses}</td>
                            <td className={`py-2 text-right ${s.pointsDiff >= 0 ? "text-win" : "text-loss"}`}>
                              {s.pointsDiff >= 0 ? "+" : ""}{s.pointsDiff}
                            </td>
                            <td className={`py-2 text-right ${s.streak?.includes("W") ? "text-win" : "text-loss"}`}>{s.streak}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Jugador destacado */}
                <div className="bg-surface border border-border rounded-xl p-4">
                  <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Jugador destacado</h2>
                  {!data.featuredStats ? (
                    <p className="text-xs text-muted py-4">Todavía no hay estadísticas cargadas esta temporada.</p>
                  ) : (
                    <>
                      <div className="rounded-lg bg-[#0D0D0F] border border-border h-28 flex items-center justify-center mb-3 text-[#3A3A40]">
                        <div className="text-center">
                          <ImageIcon size={22} className="mx-auto mb-1" />
                          <div className="text-[9px] uppercase tracking-wider">Captura 2K27</div>
                        </div>
                      </div>
                      <div className="font-black text-sm uppercase">{data.featuredStats.player.gamertag}</div>
                      <div className="text-[11px] text-muted mb-3">
                        {data.featuredStats.player.position ?? ""} · {data.featuredStats.team?.name ?? "Sin equipo"}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div>
                          <div className="font-mono font-bold text-lg text-gold">{data.featuredStats.ppg}</div>
                          <div className="text-[9px] text-muted uppercase">PPG</div>
                        </div>
                        <div>
                          <div className="font-mono font-bold text-lg text-gold">{data.featuredStats.rpg}</div>
                          <div className="text-[9px] text-muted uppercase">RPG</div>
                        </div>
                        <div>
                          <div className="font-mono font-bold text-lg text-gold">{data.featuredStats.apg}</div>
                          <div className="text-[9px] text-muted uppercase">APG</div>
                        </div>
                      </div>
                      <a
                        href={`/jugadores/${data.featuredStats.player.id}`}
                        className="block text-center w-full bg-gold text-black text-[11px] uppercase tracking-wide font-bold py-2.5 rounded-md"
                      >
                        Ver perfil completo
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted">Últimos resultados</h2>
                    <a href="/partidos" className="text-[11px] text-gold">Ver todos</a>
                  </div>
                  {data.recentResults.length === 0 ? (
                    <p className="text-xs text-muted py-4">Todavía no se ha jugado ningún partido.</p>
                  ) : (
                    <div className="space-y-1">
                      {data.recentResults.map((g) => {
                        const homeWon = (g.homeScore ?? 0) > (g.awayScore ?? 0);
                        return (
                          <div key={g.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div className="flex items-center gap-1.5 text-xs min-w-0">
                              <TeamBadge logoUrl={g.homeTeam.logoUrl} letter={g.homeTeam.name[0]} color={g.homeTeam.primaryColor ?? "#C9A227"} />
                              <span className={`truncate ${homeWon ? "font-bold" : "text-muted"}`}>{g.homeTeam.name}</span>
                              <span className="text-muted">·</span>
                              <TeamBadge logoUrl={g.awayTeam.logoUrl} letter={g.awayTeam.name[0]} color={g.awayTeam.primaryColor ?? "#8B8B93"} />
                              <span className={`truncate ${!homeWon ? "font-bold" : "text-muted"}`}>{g.awayTeam.name}</span>
                            </div>
                            <span className="font-mono font-bold text-xs shrink-0 ml-2">
                              {g.homeScore} - {g.awayScore}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-surface border border-border rounded-xl p-4">
                  <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Noticias recientes</h2>
                  {data.news.length === 0 ? (
                    <p className="text-xs text-muted py-4">Todavía no se ha publicado ninguna noticia.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {data.news.map((n, i) => (
                        <div key={n.id} className={`flex gap-2.5 ${i > 0 ? "pt-2.5 border-t border-border" : ""}`}>
                          <div className="w-12 h-9 rounded bg-[#0D0D0F] border border-border shrink-0" />
                          <div>
                            <div className="text-xs font-medium leading-snug">{n.title}</div>
                            <div className="text-[10px] text-muted mt-0.5">
                              {new Date(n.publishedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <a href="/noticias" className="block text-center w-full mt-3 border border-[#2A2A2E] text-muted text-[10px] uppercase tracking-wide font-bold py-2 rounded-md">
                    Ver todas las noticias
                  </a>
                </div>

                <div className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted">Estadísticas líderes</h2>
                    <a href="/estadisticas" className="text-[11px] text-gold">Ver todas</a>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Puntos por partido", stats: data.leaders.topScorer, value: data.leaders.topScorer?.ppg },
                      { label: "Asistencias por partido", stats: data.leaders.topAssists, value: data.leaders.topAssists?.apg },
                      { label: "Rebotes por partido", stats: data.leaders.topRebounds, value: data.leaders.topRebounds?.rpg },
                      { label: "Robos por partido", stats: data.leaders.topSteals, value: data.leaders.topSteals?.spg },
                    ].map((row, i) =>
                      row.stats ? (
                        <div key={i} className={`flex items-center justify-between text-sm ${i > 0 ? "pt-2.5 border-t border-border" : ""}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#0D0D0F] border border-border" />
                            <div>
                              <div className="text-[9px] text-muted uppercase">{row.label}</div>
                              <div className="text-xs font-medium">
                                {row.stats.player.gamertag} ({row.stats.team?.shortName ?? row.stats.team?.name})
                              </div>
                            </div>
                          </div>
                          <div className="font-mono font-bold text-gold">{row.value}</div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Bottom banners */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="font-black uppercase text-sm">Únete a la competición</div>
              <div className="text-xs text-muted mt-1 mb-3">
                ¿Crees que tienes lo necesario para ser el mejor? Forma tu equipo y compite por la gloria.
              </div>
              <a href="/inscripcion" className="inline-block bg-gold text-black font-bold text-[11px] uppercase tracking-wide px-4 py-2.5 rounded-md">
                Inscribe tu equipo
              </a>
            </div>

            <div className="bg-gradient-to-br from-[#1A1030] to-[#0A0A0B] border border-[#2A1F45] rounded-xl p-5">
              {featuredTournament ? (
                <>
                  <div className="font-black uppercase text-sm text-gold">{featuredTournament.name}</div>
                  <div className="text-xs text-muted mt-1">
                    {featuredTournament.status === "ONGOING" ? "Torneo en curso" : "Próximo torneo"}
                  </div>
                  <div className="font-bold text-sm my-1 uppercase">
                    {new Date(featuredTournament.startDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                    {featuredTournament.endDate
                      ? ` – ${new Date(featuredTournament.endDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}`
                      : ""}
                  </div>
                  {featuredTournament.prizePool && (
                    <div className="text-xs text-muted mb-3">{featuredTournament.prizePool}</div>
                  )}
                  <a
                    href={`/torneos/${featuredTournament.id}`}
                    className="inline-block bg-[#2A1F45] text-white font-bold text-[11px] uppercase tracking-wide px-4 py-2.5 rounded-md border border-[#3A2D5C]"
                  >
                    Más información
                  </a>
                </>
              ) : (
                <>
                  <div className="font-black uppercase text-sm text-gold">Torneos</div>
                  <div className="text-xs text-muted mt-1 mb-3">
                    No hay ningún torneo programado ahora mismo. Vuelve pronto.
                  </div>
                  <a
                    href="/torneos"
                    className="inline-block bg-[#2A1F45] text-white font-bold text-[11px] uppercase tracking-wide px-4 py-2.5 rounded-md border border-[#3A2D5C]"
                  >
                    Ver torneos
                  </a>
                </>
              )}
            </div>

            <div className="bg-gradient-to-br from-[#1C1440] to-[#0A0A0B] border border-[#2A1F45] rounded-xl p-5">
              <div className="font-black uppercase text-sm">
                Síguenos en <span className="text-[#7B6FE0]">Discord</span>
              </div>
              <div className="text-xs text-muted mt-1 mb-3">Únete a nuestra comunidad para estar al día de todo.</div>
              <a
                href="https://discord.gg/TJhhDhDXK"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#5865F2] text-white font-bold text-[11px] uppercase tracking-wide px-4 py-2.5 rounded-md"
              >
                Unirse al Discord
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
