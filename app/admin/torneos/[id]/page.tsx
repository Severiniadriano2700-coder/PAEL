import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import TournamentMatchesManager from "@/components/admin/TournamentMatchesManager";

export const dynamic = "force-dynamic";

async function getTournament(id: string) {
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
    ? await prisma.team.findMany({ where: { id: { in: teamIds } }, select: { id: true, name: true } })
    : await prisma.team.findMany({ where: { isActive: true }, select: { id: true, name: true } });

  return { tournament, participatingTeams };
}

export default async function AdminTournamentDetailPage({ params }: { params: { id: string } }) {
  const data = await getTournament(params.id);
  if (!data) notFound();
  const { tournament, participatingTeams } = data;

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin/torneos" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 max-w-[1200px] w-full">
          <a href="/admin/torneos" className="text-xs text-muted hover:text-gold transition-colors">
            ← Volver a torneos
          </a>
          <h1 className="font-display uppercase text-3xl mt-2 mb-1">{tournament.name}</h1>
          <p className="text-muted text-sm mb-6">
            Gestiona los partidos de este torneo: crea, edita, elimina y registra resultados.
          </p>

          {participatingTeams.length === 0 && (
            <div className="bg-surface border border-gold/40 rounded-xl p-4 mb-4 text-xs text-muted">
              Todavía no hay equipos activos disponibles para este torneo.
            </div>
          )}

          <TournamentMatchesManager
            tournamentId={tournament.id}
            initialGames={JSON.parse(JSON.stringify(tournament.games))}
            teams={participatingTeams}
          />

          <div className="mt-4">
            <a href={`/torneos/${tournament.id}`} className="text-xs text-gold hover:underline">
              Ver página pública del torneo →
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
