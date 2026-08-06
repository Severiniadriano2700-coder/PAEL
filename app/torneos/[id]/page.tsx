import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";
import { Trophy, BarChart2, Users, Calendar, Crown, Star } from "lucide-react";
import {
  getTournamentPlayerLeaders,
  getTournamentTeamStats,
  getTournamentChampion,
  getTournamentMvp,
} from "@/lib/tournamentStats";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { UPCOMING: "Próximo", ONGOING: "En curso", FINISHED: "Finalizado" };

const CATEGORIES: { key: string; label: string; suffix?: string }[] = [
  { key: "ppg", label: "Puntos" },
  { key: "rpg", label: "Rebotes" },
  { key: "apg", label: "Asistencias" },
  { key: "spg", label: "Robos" },
  { key: "bpg", label: "Tapones" },
  { key: "tpg", label: "Pérdidas" },
  { key: "fgPct", label: "TC%", suffix: "%" },
  { key: "threePct", label: "3PT%", suffix: "%" },
  { key: "ftPct", label: "TL%", suffix: "%" },
  { key: "doubleDoubles", label: "Dobles-dobles" },
  { key: "tripleDoubles", label: "Triples-dobles" },
  { key: "gamesPlayed", label: "Partidos jugados" },
];

async function getTournament(id: string, sortCat: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      games: { include: { homeTeam: true, awayTeam: true }, orderBy: { scheduledAt: "asc" } },
    },
  });
  if (!tournament) return null;

  const approvedRegistrations = await prisma.teamRegistration.findMany({
    where: { tournamentId: id, approvedTeamId: { not: null } },
  });
  const teamIds = approvedRegistrations.map((r) => r.approvedTeamId!).filter(Boolean);
  const participatingTeams = teamIds.length
    ? await prisma.team.findMany({ where: { id: { in: teamIds } } })
    : [...new Map(tournament.games.flatMap((g) => [[g.homeTeam.id, g.homeTeam], [g.awayTeam.id, g.awayTeam]])).values()];

  const [playerLeadersRaw, teamStats, champion, mvp] = await Promise.all([
    getTournamentPlayerLeaders(id),
    getTournamentTeamStats(id),
    getTournamentChampion(id),
    getTournamentMvp(id),
  ]);

  const playerLeaders = [...playerLeadersRaw].sort((a, b) => {
    const av = (a as any)[sortCat] ?? 0;
    const bv = (b as any)[sortCat] ?? 0;
    return bv - av;
  });

  const rounds = [...new Set(tournament.games.map((g) => g.round).filter(Boolean))] as string[];
  const noRoundGames = tournament.games.filter((g) => !g.round);

  return { tournament, participatingTeams, playerLeaders, teamStats, champion, mvp, rounds, noRoundGames };
}

export default async function TournamentDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { cat?: string };
}) {
  const activeCat = CATEGORIES.find((c) => c.key === searchParams.cat)?.key ?? "ppg";
  const data = await getTournament(params.id, activeCat);
  if (!data) notFound();
  const { tournament, participatingTeams, playerLeaders, teamStats, champion, mvp, rounds, noRoundGames } = data;
  const activeCatMeta = CATEGORIES.find((c) => c.key === activeCat)!;

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/torneos" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <a href="/torneos" className="text-xs text-muted hover:text-gold transition-colors">← Volver a torneos</a>

          <div className="bg-surface border border-border rounded-xl p-6 flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/trophy-torneo.png" alt="Trofeo del torneo" className="w-14 h-14 object-contain shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display uppercase text-3xl leading-none">{tournament.name}</h1>
                <span className="text-[10px] uppercase font-bold text-muted border border-border rounded px-2 py-0.5">
                  {STATUS_LABEL[tournament.status] ?? tournament.status}
                </span>
              </div>
              <div className="text-sm text-muted mt-2">{tournament.format}</div>
              <div className="text-sm text-muted mt-1">
                {new Date(tournament.startDate).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                {tournament.endDate ? ` – ${new Date(tournament.endDate).toLocaleDateString("es-ES", { day: "2-digit", month: "long" })}` : ""}
              </div>
              {tournament.prizePool && (
                <div className="flex items-center gap-1.5 text-gold font-bold text-sm mt-3">
                  <Trophy size={14} /> {tournament.prizePool}
                </div>
              )}
            </div>
          </div>

          {/* Campeón y MVP */}
          {(champion || mvp) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {champion && (
                <div className="bg-gradient-to-br from-[#2A2107] to-[#0A0A0B] border border-gold/40 rounded-xl p-5 flex items-center gap-3">
                  <Crown size={24} className="text-gold shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-gold">Campeón</div>
                    <a href={`/equipos/${champion.id}`} className="flex items-center gap-2 mt-1 hover:text-gold transition-colors">
                      <TeamBadge letter={champion.name[0]} color={champion.primaryColor ?? "#C9A227"} />
                      <span className="font-display uppercase text-lg leading-none">{champion.name}</span>
                    </a>
                  </div>
                </div>
              )}
              {mvp && (
                <div className="bg-gradient-to-br from-[#1A1030] to-[#0A0A0B] border border-[#2A1F45] rounded-xl p-5 flex items-center gap-3">
                  <Star size={24} className="text-gold shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-gold">
                      MVP {mvp.official ? "" : "(votación en curso)"}
                    </div>
                    <a href={`/jugadores/${mvp.player.id}`} className="font-display uppercase text-lg leading-none hover:text-gold transition-colors block mt-1">
                      {mvp.player.gamertag}
                    </a>
                    {mvp.votes !== null && <div className="text-[10px] text-muted mt-0.5">{mvp.votes} voto{mvp.votes !== 1 ? "s" : ""}</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-surface border border-border rounded-xl p-4">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3 flex items-center gap-1.5">
              <Users size={13} /> Equipos participantes
            </h2>
            {participatingTeams.length === 0 ? (
              <p className="text-xs text-muted py-4">Todavía no hay equipos confirmados para este torneo.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {participatingTeams.map((t) => (
                  <a
                    key={t.id}
                    href={`/equipos/${t.id}`}
                    className="flex items-center gap-2 bg-[#0D0D0F] border border-border rounded-lg px-3 py-2 hover:border-gold transition-colors"
                  >
                    <TeamBadge letter={t.name[0]} color={t.primaryColor ?? "#C9A227"} />
                    <span className="text-xs font-semibold truncate">{t.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Estadísticas de equipo */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3 flex items-center gap-1.5">
              <BarChart2 size={13} /> Estadísticas de equipo
            </h2>
            {teamStats.length === 0 ? (
              <p className="text-xs text-muted py-4">Todavía no hay partidos finalizados en este torneo.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted text-left">
                    <th className="font-normal pb-2">Equipo</th>
                    <th className="font-normal pb-2 text-right">V</th>
                    <th className="font-normal pb-2 text-right">D</th>
                    <th className="font-normal pb-2 text-right">PF</th>
                    <th className="font-normal pb-2 text-right">PC</th>
                    <th className="font-normal pb-2 text-right">Dif</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {teamStats.map((t) => (
                    <tr key={t.teamId} className="border-t border-border">
                      <td className="py-2 font-sans font-semibold">
                        <a href={`/equipos/${t.teamId}`} className="flex items-center gap-1.5 hover:text-gold transition-colors">
                          <TeamBadge letter={t.teamName[0]} color={t.primaryColor ?? "#C9A227"} /> {t.teamName}
                        </a>
                      </td>
                      <td className="py-2 text-right">{t.wins}</td>
                      <td className="py-2 text-right">{t.losses}</td>
                      <td className="py-2 text-right">{t.pointsFor}</td>
                      <td className="py-2 text-right">{t.pointsAgainst}</td>
                      <td className={`py-2 text-right ${t.pointsFor - t.pointsAgainst >= 0 ? "text-win" : "text-loss"}`}>
                        {t.pointsFor - t.pointsAgainst >= 0 ? "+" : ""}{t.pointsFor - t.pointsAgainst}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Líderes estadísticos */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3 flex items-center gap-1.5">
              <BarChart2 size={13} /> Líderes del torneo
            </h2>
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {CATEGORIES.map((c) => (
                <a
                  key={c.key}
                  href={`/torneos/${tournament.id}?cat=${c.key}`}
                  className={`text-[10px] uppercase tracking-wide font-bold px-2.5 py-1.5 rounded-md border transition-colors ${
                    activeCat === c.key ? "border-gold text-gold bg-gold/10" : "border-border text-muted hover:text-white"
                  }`}
                >
                  {c.label}
                </a>
              ))}
            </div>
            {playerLeaders.length === 0 ? (
              <p className="text-xs text-muted py-4">Todavía no hay estadísticas registradas en este torneo.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted text-left">
                      <th className="font-normal pb-2">#</th>
                      <th className="font-normal pb-2">Jugador</th>
                      <th className="font-normal pb-2">Equipo</th>
                      <th className="font-normal pb-2 text-right">PJ</th>
                      <th className="font-normal pb-2 text-right">{activeCatMeta.label}</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {playerLeaders.map((s, i) => (
                      <tr key={s.playerId} className="border-t border-border">
                        <td className="py-2 text-muted">{i + 1}</td>
                        <td className="py-2 font-sans font-semibold">
                          <a href={`/torneos/${tournament.id}/jugadores/${s.playerId}`} className="hover:text-gold transition-colors">
                            {s.gamertag}
                          </a>
                        </td>
                        <td className="py-2 font-sans text-muted">{s.teamName}</td>
                        <td className="py-2 text-right">{s.gamesPlayed}</td>
                        <td className="py-2 text-right text-gold font-bold">
                          {(s as any)[activeCat] ?? 0}{activeCatMeta.suffix ?? ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bracket / partidos por ronda */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3 flex items-center gap-1.5">
              <Calendar size={13} /> Bracket y partidos
            </h2>
            {tournament.games.length === 0 ? (
              <p className="text-xs text-muted py-8 text-center">Todavía no hay partidos programados para este torneo.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rounds.map((round) => (
                  <div key={round} className="space-y-2">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold">{round}</h3>
                    {tournament.games
                      .filter((g) => g.round === round)
                      .map((g) => (
                        <GameCard key={g.id} game={g} />
                      ))}
                  </div>
                ))}
                {noRoundGames.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted">Sin ronda asignada</h3>
                    {noRoundGames.map((g) => (
                      <GameCard key={g.id} game={g} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function GameCard({
  game,
}: {
  game: {
    id: string;
    homeTeam: { name: string; primaryColor: string | null };
    awayTeam: { name: string; primaryColor: string | null };
    scheduledAt: Date;
    status: string;
    homeScore: number | null;
    awayScore: number | null;
  };
}) {
  return (
    <div className="bg-[#0D0D0F] border border-border rounded-lg p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold">
          <TeamBadge letter={game.homeTeam.name[0]} color={game.homeTeam.primaryColor ?? "#C9A227"} />
          {game.homeTeam.name}
        </span>
        <span className="font-mono">{game.status === "FINISHED" ? game.homeScore : "–"}</span>
      </div>
      <div className="flex items-center justify-between text-xs mt-1.5">
        <span className="flex items-center gap-1.5 font-semibold">
          <TeamBadge letter={game.awayTeam.name[0]} color={game.awayTeam.primaryColor ?? "#8B8B93"} />
          {game.awayTeam.name}
        </span>
        <span className="font-mono">{game.status === "FINISHED" ? game.awayScore : "–"}</span>
      </div>
      <div className="text-[10px] text-muted mt-2 pt-2 border-t border-border">
        {new Date(game.scheduledAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
        {" · "}
        {new Date(game.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
        {game.status !== "FINISHED" && (
          <span className="ml-2 uppercase font-bold">
            {game.status === "SCHEDULED" ? "Programado" : game.status === "LIVE" ? "En vivo" : game.status}
          </span>
        )}
      </div>
    </div>
  );
}
