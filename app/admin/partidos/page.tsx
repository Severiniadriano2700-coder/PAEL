import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import GamesManager from "@/components/admin/GamesManager";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  const [games, teams, activeSeason] = await Promise.all([
    prisma.game.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.season.findFirst({ where: { isActive: true } }),
  ]);

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin/partidos" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 max-w-[1200px] w-full mt-[57px] md:mt-0">
          <h1 className="font-display uppercase text-3xl mb-1">Partidos</h1>
          <p className="text-muted text-sm mb-6">
            Programa partidos y registra resultados con estadísticas por jugador.
          </p>
          {!activeSeason && (
            <div className="bg-surface border border-gold/40 rounded-xl p-4 mb-4 text-xs text-muted">
              No hay ninguna temporada activa. Los partidos que crees no se asociarán a ninguna temporada hasta que actives una.
            </div>
          )}
          <GamesManager
            initialGames={JSON.parse(JSON.stringify(games))}
            teams={teams}
            activeSeasonId={activeSeason?.id ?? null}
          />
        </main>
      </div>
    </div>
  );
}
