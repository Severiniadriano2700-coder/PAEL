import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ImageIcon, Twitter, Twitch, Youtube, Trophy } from "lucide-react";
import PlayerStatsProfile from "@/components/PlayerStatsProfile";
import { buildMatchLog, computeAveragesFromMatchLog } from "@/lib/playerProfile";

export const dynamic = "force-dynamic";

async function getPlayer(id: string) {
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      seasonStats: { include: { season: true, team: true }, orderBy: { season: { startDate: "desc" } } },
      awards: { include: { season: true, tournament: true } },
    },
  });
  if (!player) return null;

  const totalGames = player.seasonStats.reduce((sum, s) => sum + s.gamesPlayed, 0);
  const weighted = (key: "ppg" | "rpg" | "apg" | "spg" | "bpg") =>
    totalGames
      ? Math.round((player.seasonStats.reduce((sum, s) => sum + s[key] * s.gamesPlayed, 0) / totalGames) * 10) / 10
      : 0;

  const career = {
    gamesPlayed: totalGames,
    ppg: weighted("ppg"),
    rpg: weighted("rpg"),
    apg: weighted("apg"),
    spg: weighted("spg"),
    bpg: weighted("bpg"),
  };

  // Historial de partidos de la temporada activa (misma lógica que el
  // perfil de jugador de torneo, pero con partidos de liga).
  const activeSeason = await prisma.season.findFirst({ where: { isActive: true } });
  const gameStats = activeSeason
    ? await prisma.playerGameStats.findMany({
        where: { playerId: id, game: { seasonId: activeSeason.id } },
        include: { game: { include: { homeTeam: true, awayTeam: true } } },
      })
    : [];
  const matchLog = buildMatchLog(gameStats);
  const seasonAverages = computeAveragesFromMatchLog(matchLog);

  return { player, career, activeSeason, matchLog, seasonAverages };
}

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const data = await getPlayer(params.id);
  if (!data) notFound();

  const { player, career, activeSeason, matchLog, seasonAverages } = data;
  const currentStats = player.seasonStats[0];

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/jugadores" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          {/* Header */}
          <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#0D0D0F] border border-border flex items-center justify-center text-[#3A3A40] shrink-0">
              <ImageIcon size={28} />
            </div>
            <div className="flex-1">
              <h1 className="font-display uppercase text-3xl leading-none">{player.gamertag}</h1>
              <div className="text-xs text-muted mt-1">
                {player.fullName ?? ""} {player.fullName ? "·" : ""} {player.position ?? "—"}
                {currentStats?.team ? ` · ${currentStats.team.name}` : " · Sin equipo"}
              </div>
              {player.bio && <p className="text-sm text-muted mt-2 max-w-xl">{player.bio}</p>}
              <div className="flex items-center gap-3 mt-3">
                {player.twitter && (
                  <a href={`https://twitter.com/${player.twitter.replace("@", "")}`} className="text-muted hover:text-gold transition-colors">
                    <Twitter size={15} />
                  </a>
                )}
                {player.twitch && (
                  <a href={`https://twitch.tv/${player.twitch}`} className="text-muted hover:text-gold transition-colors">
                    <Twitch size={15} />
                  </a>
                )}
                {player.youtube && (
                  <a href={`https://youtube.com/${player.youtube}`} className="text-muted hover:text-gold transition-colors">
                    <Youtube size={15} />
                  </a>
                )}
              </div>
            </div>
            {currentStats && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-mono font-bold text-xl text-gold">{currentStats.ppg}</div>
                  <div className="text-[9px] text-muted uppercase">PPG</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-xl">{currentStats.rpg}</div>
                  <div className="text-[9px] text-muted uppercase">RPG</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-xl">{currentStats.apg}</div>
                  <div className="text-[9px] text-muted uppercase">APG</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Estadísticas de carrera */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Estadísticas de carrera</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "PPG", value: career.ppg },
                  { label: "RPG", value: career.rpg },
                  { label: "APG", value: career.apg },
                  { label: "SPG", value: career.spg },
                  { label: "BPG", value: career.bpg },
                  { label: "Partidos", value: career.gamesPlayed },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-mono font-bold text-lg">{s.value}</div>
                    <div className="text-[9px] text-muted uppercase">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premios */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-4">
              <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Premios</h2>
              {player.awards.length === 0 ? (
                <p className="text-xs text-muted py-4">Todavía no ha ganado ningún premio.</p>
              ) : (
                <div className="space-y-1.5">
                  {player.awards.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm border-t border-border pt-1.5 first:border-0 first:pt-0">
                      <div className="flex items-center gap-2">
                        <Trophy size={13} className="text-gold" />
                        <span className="font-semibold">{a.type}</span>
                      </div>
                      <span className="text-muted text-xs">{a.season?.name ?? a.tournament?.name ?? "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historial de temporadas */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-3">Historial de temporadas</h2>
            {player.seasonStats.length === 0 ? (
              <p className="text-xs text-muted py-4">Este jugador todavía no tiene historial de temporadas.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted text-left">
                    <th className="font-normal pb-2">Temporada</th>
                    <th className="font-normal pb-2">Equipo</th>
                    <th className="font-normal pb-2 text-right">PJ</th>
                    <th className="font-normal pb-2 text-right">PPG</th>
                    <th className="font-normal pb-2 text-right">RPG</th>
                    <th className="font-normal pb-2 text-right">APG</th>
                    <th className="font-normal pb-2 text-right">SPG</th>
                    <th className="font-normal pb-2 text-right">BPG</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {player.seasonStats.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2 font-sans font-semibold">{s.season.name}</td>
                      <td className="py-2 font-sans text-muted">{s.team?.name ?? "Sin equipo"}</td>
                      <td className="py-2 text-right">{s.gamesPlayed}</td>
                      <td className="py-2 text-right text-gold">{s.ppg}</td>
                      <td className="py-2 text-right">{s.rpg}</td>
                      <td className="py-2 text-right">{s.apg}</td>
                      <td className="py-2 text-right">{s.spg}</td>
                      <td className="py-2 text-right">{s.bpg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Historial de partidos de la temporada activa */}
          <PlayerStatsProfile
            averages={seasonAverages}
            matchLog={matchLog}
            emptyLabel={
              activeSeason
                ? "Este jugador todavía no tiene partidos registrados esta temporada."
                : "No hay ninguna temporada activa ahora mismo."
            }
          />
        </main>
      </div>
    </div>
  );
}
