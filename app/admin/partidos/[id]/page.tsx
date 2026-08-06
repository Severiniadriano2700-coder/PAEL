import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import GameResultForm from "@/components/admin/GameResultForm";

export const dynamic = "force-dynamic";

async function getGameData(id: string) {
  const game = await prisma.game.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true, tournament: true, season: true },
  });
  if (!game) return null;

  // El "roster" de un equipo es simplemente la lista de jugadores que se le
  // han asignado alguna vez (vía PlayerSeasonStats) — vale igual para un
  // partido de liga que de torneo, un equipo tiene la misma plantilla en
  // ambas competiciones.
  const allStats = await prisma.playerSeasonStats.findMany({
    where: { teamId: { in: [game.homeTeamId, game.awayTeamId] } },
    include: { player: true, season: true },
    orderBy: { season: { startDate: "desc" } },
  });
  const seenPlayers = new Set<string>();
  const roster = allStats.filter((s) => {
    if (seenPlayers.has(s.playerId)) return false;
    seenPlayers.add(s.playerId);
    return true;
  });

  const existingStats = await prisma.playerGameStats.findMany({ where: { gameId: id } });

  return { game, roster, existingStats };
}

export default async function AdminGameResultPage({ params }: { params: { id: string } }) {
  const data = await getGameData(params.id);
  if (!data) notFound();

  const { game, roster, existingStats } = data;

  const homeRoster = roster
    .filter((r) => r.teamId === game.homeTeamId)
    .map((r) => ({ playerId: r.playerId, gamertag: r.player.gamertag }));
  const awayRoster = roster
    .filter((r) => r.teamId === game.awayTeamId)
    .map((r) => ({ playerId: r.playerId, gamertag: r.player.gamertag }));

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin/partidos" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 max-w-[1200px] w-full">
          <a href="/admin/partidos" className="text-xs text-muted hover:text-gold transition-colors">
            ← Volver a partidos
          </a>
          <h1 className="font-display uppercase text-3xl mt-2 mb-1">
            {game.homeTeam.name} <span className="text-muted">vs</span> {game.awayTeam.name}
          </h1>
          <p className="text-muted text-sm mb-6">
            {new Date(game.scheduledAt).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
            {" · "}
            {new Date(game.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            {game.tournament ? ` · ${game.tournament.name}` : game.season ? ` · ${game.season.name}` : ""}
          </p>

          {!game.seasonId && !game.tournamentId ? (
            <div className="bg-surface border border-border rounded-xl p-6 text-sm text-muted">
              Este partido no está asociado a ninguna temporada ni torneo, así que no se pueden registrar estadísticas de jugadores.
            </div>
          ) : (
            <GameResultForm
              gameId={game.id}
              homeTeam={{ id: game.homeTeamId, name: game.homeTeam.name, roster: homeRoster }}
              awayTeam={{ id: game.awayTeamId, name: game.awayTeam.name, roster: awayRoster }}
              initialHomeScore={game.homeScore}
              initialAwayScore={game.awayScore}
              existingStats={existingStats}
            />
          )}
        </main>
      </div>
    </div>
  );
}
