import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import PlayersManager from "@/components/admin/PlayersManager";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  const activeSeason = await prisma.season.findFirst({ where: { isActive: true } });

  const [players, teams] = await Promise.all([
    prisma.player.findMany({
      orderBy: { gamertag: "asc" },
      include: {
        seasonStats: activeSeason ? { where: { seasonId: activeSeason.id } } : false,
      },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const playersWithTeam = players.map((p) => ({
    id: p.id,
    gamertag: p.gamertag,
    fullName: p.fullName,
    position: p.position,
    bio: p.bio,
    avatarUrl: p.avatarUrl,
    twitter: p.twitter,
    twitch: p.twitch,
    youtube: p.youtube,
    isActive: p.isActive,
    currentTeamId: p.seasonStats?.[0]?.teamId ?? null,
  }));

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin/jugadores" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 max-w-[1200px] w-full">
          <h1 className="font-display uppercase text-3xl mb-1">Jugadores</h1>
          <p className="text-muted text-sm mb-6">Crea, edita y elimina los jugadores de la liga.</p>
          <PlayersManager initialPlayers={playersWithTeam} teams={teams} />
        </main>
      </div>
    </div>
  );
}
