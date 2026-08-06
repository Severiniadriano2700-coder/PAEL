import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import PlayerStatsProfile from "@/components/PlayerStatsProfile";
import { buildMatchLog, computeAveragesFromMatchLog } from "@/lib/playerProfile";
import { ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

async function getData(tournamentId: string, playerId: string) {
  const [tournament, player] = await Promise.all([
    prisma.tournament.findUnique({ where: { id: tournamentId } }),
    prisma.player.findUnique({ where: { id: playerId } }),
  ]);
  if (!tournament || !player) return null;

  const gameStats = await prisma.playerGameStats.findMany({
    where: { playerId, game: { tournamentId } },
    include: { game: { include: { homeTeam: true, awayTeam: true } } },
  });

  const matchLog = buildMatchLog(gameStats);
  const averages = computeAveragesFromMatchLog(matchLog);
  const teamName = gameStats[0]
    ? (gameStats[0].teamId === gameStats[0].game.homeTeamId ? gameStats[0].game.homeTeam.name : gameStats[0].game.awayTeam.name)
    : null;

  return { tournament, player, matchLog, averages, teamName };
}

export default async function TournamentPlayerProfilePage({
  params,
}: {
  params: { id: string; playerId: string };
}) {
  const data = await getData(params.id, params.playerId);
  if (!data) notFound();
  const { tournament, player, matchLog, averages, teamName } = data;

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/torneos" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <a href={`/torneos/${tournament.id}`} className="text-xs text-muted hover:text-gold transition-colors">
            ← Volver a {tournament.name}
          </a>

          <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#0D0D0F] border border-border flex items-center justify-center text-[#3A3A40] shrink-0">
              <ImageIcon size={22} />
            </div>
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">{player.gamertag}</h1>
              <div className="text-xs text-muted mt-1">
                {tournament.name}
                {teamName ? ` · ${teamName}` : ""}
              </div>
            </div>
          </div>

          <PlayerStatsProfile
            averages={averages}
            matchLog={matchLog}
            emptyLabel="Este jugador todavía no tiene partidos registrados en este torneo."
          />
        </main>
      </div>
    </div>
  );
}
